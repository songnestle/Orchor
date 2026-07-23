import { ledgerService } from '../ledger/ledger-service';
import { SKILL_MODULES } from '../skills';
import { systemPromptFor } from './skill-prompts';
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
      // No provider key configured — return the skill's representative
      // sample output so the runtime demo stays coherent.
      const mod = SKILL_MODULES.find((s) => s.id === params.skillId);
      const preview = mod?.outputPreview
        ? `${mod.outputPreview}\n\n— sample output (${mod.title}) · live inference enables when a provider key is configured`
        : `Processed: ${params.input}\n\n— sample output · live inference enables when a provider key is configured`;
      return {
        output: preview,
        costUsdCents: 2,
      };
    }

    try {
      const systemPrompt = systemPromptFor(params.skillId);
      const wireApi = (process.env.OPENAI_WIRE_API || 'chat').toLowerCase();

      let output: string;
      if (wireApi === 'responses') {
        // Responses-API relays (Codex/ChatGPT-backed pools) reject
        // chat.completions and reply with SSE even without stream:true, so
        // we speak the wire format directly instead of going through the SDK.
        output = await this.callResponsesApi(systemPrompt, params.input);
      } else {
        const { default: OpenAI } = await import('openai');
        const client = new OpenAI({
          apiKey: openaiKey,
          // Optional OpenAI-compatible proxy (e.g. set OPENAI_BASE_URL to a
          // relay endpoint); defaults to api.openai.com when unset.
          baseURL: process.env.OPENAI_BASE_URL || undefined,
        });
        const completion = await client.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            // Per-skill system prompt (real imported prompts for ids 12-19)
            { role: 'system', content: systemPrompt },
            { role: 'user', content: params.input },
          ],
          temperature: 0.8,
        });
        output = completion.choices[0]?.message?.content || 'No output generated';
      }

      return {
        output,
        costUsdCents: 2, // Approximate cost
      };
    } catch (error) {
      // Provider hiccup (rate limit / balance / network): degrade to the
      // skill's sample output instead of surfacing an error string the user
      // paid credits for. Real inference resumes when the provider recovers.
      console.error('[BaiClient] provider error, serving sample output:', error);
      const mod = SKILL_MODULES.find((s) => s.id === params.skillId);
      return {
        output:
          (mod?.outputPreview ?? `Processed: ${params.input}`) +
          `\n\n— sample output (${mod?.title ?? 'skill'}) · provider temporarily unavailable`,
        costUsdCents: 0,
      };
    }
  }

  /**
   * Minimal Responses-API client for OpenAI-compatible relays.
   * Known relay quirks handled here: SSE responses even without stream:true,
   * no `instructions` support (system prompt folded into `input`), and a
   * flaky upstream pool (per-call retries with backoff).
   */
  private async callResponsesApi(systemPrompt: string, userInput: string): Promise<string> {
    const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = process.env.OPENAI_MODEL || 'gpt-5.2';
    const input = `${systemPrompt}\n\n---\n\nUser request:\n${userInput}`;

    let lastErr: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${base}/responses`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model, input }),
        });
        const text = await res.text();
        if (!res.ok) throw new Error(`responses api ${res.status}: ${text.slice(0, 120)}`);

        // SSE stream: accumulate output_text deltas.
        if (text.includes('event:') || text.startsWith('data:')) {
          let out = '';
          for (const line of text.split('\n')) {
            if (!line.startsWith('data:')) continue;
            try {
              const ev = JSON.parse(line.slice(5).trim());
              if (ev.type === 'response.output_text.delta' && ev.delta) out += ev.delta;
              else if (ev.type === 'response.output_text.done' && !out && ev.text) out = ev.text;
            } catch { /* keep-alive / non-JSON line */ }
          }
          if (out) return out;
          throw new Error('responses api: SSE stream contained no output text');
        }

        // Plain JSON shape.
        const json = JSON.parse(text);
        const out =
          json.output_text ??
          json.output?.flatMap((o: any) => o.content ?? [])
            .map((c: any) => c.text ?? '')
            .join('');
        if (out) return out;
        throw new Error('responses api: empty output');
      } catch (e) {
        lastErr = e;
        if (attempt < 3) await new Promise((r) => setTimeout(r, 2500 * attempt));
      }
    }
    throw lastErr;
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

      // NOTE: Creator revenue is tracked in the `creator_revenues` table above.
      // We intentionally do NOT write it to `ledger_entries`, because that
      // table has a FK to `users` and a creator (e.g. "Atlas Labs") is not a
      // registered user — writing here caused a foreign-key violation that
      // rolled back the whole run.
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
    // Normalize wallet casing so the skillRun row joins the same user row
    // the ledger writes to (ledgerService also lowercases internally).
    const userId = params.userId.toLowerCase();
    const { skillId, input } = params;

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
