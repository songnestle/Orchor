import { ledgerService } from '../ledger/ledger-service';
import { SKILL_MODULES } from '../skills';
import { usePublished } from '../publishedStore';
import { prisma } from '../db';
import { createHash } from 'crypto';

export interface SkillExecutionParams {
  userId: string;
  skillId: number;
  input: string;
}

export interface SkillExecutionResult {
  output: string;
  runtimeMs: number;
  creditsCharged: bigint;
  creatorRevenue: bigint;
  platformFee: bigint;
  runtimeCost: number; // USD cents
}

/**
 * B.ai Runtime Client (Mock for Phase 1, real integration in Phase 5)
 */
class BaiRuntimeClient {
  async executeSkill(params: {
    skillId: number;
    input: string;
    userId: string;
  }): Promise<{ output: string; costUsdCents: number }> {
    // Phase 1: Use OpenAI as fallback
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      // Return mock output
      return {
        output: `[Mock B.ai Output for Skill ${params.skillId}]\n\nInput: ${params.input}\n\nThis is a simulated response. In production, this would be powered by B.ai Runtime or OpenAI.`,
        costUsdCents: 2,
      };
    }

    try {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey: openaiKey });

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI skill executor. Process the user's request concisely and helpfully.`,
          },
          {
            role: 'user',
            content: params.input,
          },
        ],
        temperature: 0.8,
      });

      const output = completion.choices[0]?.message?.content || 'No output generated';

      return {
        output,
        costUsdCents: 2, // Approximate cost
      };
    } catch (error) {
      console.error('[BaiClient] OpenAI error:', error);
      return {
        output: `Error executing skill: ${error instanceof Error ? error.message : 'Unknown error'}`,
        costUsdCents: 0,
      };
    }
  }
}

const baiClient = new BaiRuntimeClient();

/**
 * Revenue Manager - Distributes revenue after skill execution
 */
class RevenueManager {
  async distribute(params: {
    skillId: number;
    creatorAddress: string;
    totalCredits: bigint;
    runtimeCostUsdCents: number;
  }) {
    // Revenue split: 70% creator, 20% platform, 10% runtime cost buffer
    const creatorRevenue = (params.totalCredits * 70n) / 100n;
    const platformFee = (params.totalCredits * 20n) / 100n;
    const runtimeBuffer = params.totalCredits - creatorRevenue - platformFee;

    // Update creator revenue record
    await prisma.$transaction(async (tx) => {
      const existing = await tx.creatorRevenue.findUnique({
        where: {
          creatorAddress_skillId: {
            creatorAddress: params.creatorAddress,
            skillId: params.skillId,
          },
        },
      });

      if (existing) {
        await tx.creatorRevenue.update({
          where: {
            creatorAddress_skillId: {
              creatorAddress: params.creatorAddress,
              skillId: params.skillId,
            },
          },
          data: {
            totalRuns: { increment: 1 },
            totalRevenue: { increment: creatorRevenue },
            withdrawableCredits: { increment: creatorRevenue },
            updatedAt: new Date(),
          },
        });
      } else {
        await tx.creatorRevenue.create({
          data: {
            creatorAddress: params.creatorAddress,
            skillId: params.skillId,
            totalRuns: 1,
            totalRevenue: creatorRevenue,
            withdrawableCredits: creatorRevenue,
          },
        });
      }

      // Record creator revenue in ledger (for transparency)
      // Note: This is internal accounting, not user credits
      await tx.ledgerEntry.create({
        data: {
          userId: params.creatorAddress,
          entryType: 'creator_revenue',
          amount: creatorRevenue,
          balanceAfter: 0n, // Creator balances tracked separately
          metadata: {
            skillId: params.skillId,
            type: 'skill_execution',
          },
        },
      });
    });

    return {
      creatorRevenue,
      platformFee,
      runtimeBuffer,
    };
  }
}

const revenueManager = new RevenueManager();

/**
 * Skill Executor - Main execution engine
 */
export class SkillExecutor {
  async execute(params: SkillExecutionParams): Promise<SkillExecutionResult> {
    const { userId, skillId, input } = params;

    // 1. Get skill details
    const skill = await this.getSkill(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    // 2. Check user balance
    const balance = await ledgerService.getBalance(userId);
    const creditsPerRun = BigInt(skill.energyCost * 10); // Convert energy to credits (1 energy ≈ 10 credits)

    if (balance < creditsPerRun) {
      throw new Error(
        `Insufficient credits. Need ${creditsPerRun}, have ${balance}`
      );
    }

    // 3. Deduct credits (atomic)
    await ledgerService.debitUser({
      userId,
      amount: creditsPerRun,
      entryType: 'skill_run',
      metadata: { skillId, inputHash: this.hashInput(input) },
    });

    // 4. Execute via B.ai Runtime
    const startTime = Date.now();
    let result;

    try {
      result = await baiClient.executeSkill({
        skillId,
        input,
        userId,
      });
    } catch (error) {
      // Refund credits on execution failure
      await ledgerService.creditUser({
        userId,
        amount: creditsPerRun,
        entryType: 'skill_run',
        metadata: { skillId, refund: true, error: String(error) },
      });
      throw error;
    }

    const runtimeMs = Date.now() - startTime;

    // 5. Distribute revenue
    const revenue = await revenueManager.distribute({
      skillId,
      creatorAddress: skill.creator,
      totalCredits: creditsPerRun,
      runtimeCostUsdCents: result.costUsdCents,
    });

    // 6. Record skill run
    await prisma.skillRun.create({
      data: {
        userId,
        skillId,
        creditsCost: creditsPerRun,
        runtimeCostUsdCents: result.costUsdCents,
        creatorRevenue: revenue.creatorRevenue,
        platformFee: revenue.platformFee,
        status: 'completed',
        inputHash: this.hashInput(input),
        outputPreview: result.output.slice(0, 200),
        runtimeMs,
        completedAt: new Date(),
      },
    });

    return {
      output: result.output,
      runtimeMs,
      creditsCharged: creditsPerRun,
      creatorRevenue: revenue.creatorRevenue,
      platformFee: revenue.platformFee,
      runtimeCost: result.costUsdCents,
    };
  }

  private async getSkill(skillId: number) {
    // First check static skills
    const staticSkill = SKILL_MODULES.find(s => s.id === skillId);
    if (staticSkill) return staticSkill;

    // Then check published skills (localStorage-based for now)
    // In production, this would query a database
    return null;
  }

  private hashInput(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
}

export const skillExecutor = new SkillExecutor();
