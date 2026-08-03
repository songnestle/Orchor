import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * OrchorCore1155 测试
 *
 * 重点不在覆盖率，在四件「错了会出事故」的事：
 * 1. 卡转走之后，原持有人的调用权必须立刻消失
 * 2. 限量卡的上限不能被绕过
 * 3. 创作者地址是恶意合约时，不能让整张卡卖不出去
 * 4. 技能名不能注入 tokenURI 的 JSON
 */
describe("OrchorCore1155", () => {
  const ONE = ethers.parseEther("1");

  async function deploy() {
    const [owner, treasury, creator, alice, bob] = await ethers.getSigners();
    const F = await ethers.getContractFactory("OrchorCore1155");
    const c = await F.deploy(treasury.address);
    await c.waitForDeployment();
    return { c, owner, treasury, creator, alice, bob };
  }

  /** 注册一张普通卡：解锁价 1 INJ，订阅 2 INJ，不限量 */
  async function registerBasic(c: any, creator: any, name = "Test Skill") {
    await c.connect(creator).registerSkill(name, 1 /* Rare */, 5, ONE, ONE * 2n, 0);
    return Number(await c.nextSkillId()) - 1;
  }

  describe("持有与权限", () => {
    it("买断后拥有调用权，且卡是 ERC-1155 余额", async () => {
      const { c, creator, alice } = await deploy();
      const id = await registerBasic(c, creator);

      await c.connect(alice).unlockSkill(id, 1, { value: ONE });

      expect(await c.balanceOf(alice.address, id)).to.equal(1n);
      expect(await c.hasAccess(alice.address, id)).to.equal(true);
    });

    it("卡转给别人后，原持有人的权限立刻消失", async () => {
      const { c, creator, alice, bob } = await deploy();
      const id = await registerBasic(c, creator);
      await c.connect(alice).unlockSkill(id, 1, { value: ONE });

      await c.connect(alice).safeTransferFrom(alice.address, bob.address, id, 1, "0x");

      // 这是整次 1155 改造最关键的一条：
      // 旧实现把权限存在独立的 owned mapping 里，卖了卡钥匙还在手上。
      expect(await c.hasAccess(alice.address, id)).to.equal(false);
      expect(await c.hasAccess(bob.address, id)).to.equal(true);
    });

    it("卡转走后无法再调用", async () => {
      const { c, creator, alice, bob } = await deploy();
      const id = await registerBasic(c, creator);
      await c.connect(alice).unlockSkill(id, 1, { value: ONE });
      await c.connect(alice).topUpEnergy({ value: ONE });

      await c.connect(alice).invokeSkill(id, ethers.id("x")); // 转走前可以

      await c.connect(alice).safeTransferFrom(alice.address, bob.address, id, 1, "0x");
      await expect(c.connect(alice).invokeSkill(id, ethers.id("y"))).to.be.revertedWith("NO_ACCESS");
    });

    it("订阅到期后权限消失，且订阅不可转让", async () => {
      const { c, creator, alice } = await deploy();
      const id = await registerBasic(c, creator);
      await c.connect(alice).subscribeSkill(id, { value: ONE * 2n });
      expect(await c.hasAccess(alice.address, id)).to.equal(true);
      expect(await c.balanceOf(alice.address, id)).to.equal(0n); // 租约不铸卡

      await ethers.provider.send("evm_increaseTime", [31 * 24 * 3600]);
      await ethers.provider.send("evm_mine", []);
      expect(await c.hasAccess(alice.address, id)).to.equal(false);
    });
  });

  describe("限量", () => {
    it("Mythic 上限不可被绕过，包括一次买多份", async () => {
      const { c, creator, alice, bob } = await deploy();
      await c.connect(creator).registerSkill("Rare Card", 4 /* Mythic */, 5, ONE, 0, 3);
      const id = Number(await c.nextSkillId()) - 1;

      await c.connect(alice).unlockSkill(id, 2, { value: ONE * 2n });
      await c.connect(bob).unlockSkill(id, 1, { value: ONE });

      await expect(
        c.connect(bob).unlockSkill(id, 1, { value: ONE })
      ).to.be.revertedWith("MINT_CAP_REACHED");
    });

    it("非 Mythic 不允许设上限，Mythic 必须设上限", async () => {
      const { c, creator } = await deploy();
      await expect(
        c.connect(creator).registerSkill("A", 1, 5, ONE, 0, 10)
      ).to.be.revertedWith("CAP_ONLY_MYTHIC");
      await expect(
        c.connect(creator).registerSkill("B", 4, 5, ONE, 0, 0)
      ).to.be.revertedWith("MYTHIC_NEEDS_CAP");
    });

    it("价格必须精确匹配份数", async () => {
      const { c, creator, alice } = await deploy();
      const id = await registerBasic(c, creator);
      await expect(
        c.connect(alice).unlockSkill(id, 2, { value: ONE })
      ).to.be.revertedWith("BAD_PRICE");
    });
  });

  describe("分账", () => {
    it("按 70/25/5 分账", async () => {
      const { c, treasury, creator, alice } = await deploy();
      const id = await registerBasic(c, creator);

      const before = await ethers.provider.getBalance(creator.address);
      const tBefore = await ethers.provider.getBalance(treasury.address);

      await c.connect(alice).unlockSkill(id, 1, { value: ONE });

      expect(await ethers.provider.getBalance(creator.address) - before).to.equal(ONE * 70n / 100n);
      expect(await ethers.provider.getBalance(treasury.address) - tBefore).to.equal(ONE * 25n / 100n);
      expect(await ethers.provider.getBalance(await c.getAddress())).to.equal(ONE * 5n / 100n);
    });

    it("创作者是会 revert 的合约时，解锁仍然成功（pull 模式）", async () => {
      const { c, alice } = await deploy();

      // 一个收不了钱的合约 —— 旧实现里这会让这张卡永久无法解锁。
      const Bad = await ethers.getContractFactory("RejectPayment");
      const bad = await Bad.deploy();
      await bad.waitForDeployment();
      await bad.register(await c.getAddress(), "Bad Creator Skill", ONE);
      const id = Number(await c.nextSkillId()) - 1;

      await expect(c.connect(alice).unlockSkill(id, 1, { value: ONE })).to.not.be.reverted;
      expect(await c.pending(await bad.getAddress())).to.equal(ONE * 70n / 100n);
    });
  });

  describe("Energy", () => {
    it("按 1 INJ = 100 ⚡ 计入，零头退回", async () => {
      const { c, alice } = await deploy();
      const pay = ethers.parseEther("0.015"); // 1.5 ⚡ → 只收 1 ⚡ 的钱
      const before = await ethers.provider.getBalance(alice.address);
      const tx = await c.connect(alice).topUpEnergy({ value: pay });
      const rc = await tx.wait();
      const gas = rc!.gasUsed * rc!.gasPrice;

      expect(await c.energyOf(alice.address)).to.equal(1n);
      // 实付应为 0.01 而不是 0.015（旧版注释说退零钱但没退）
      const spent = before - await ethers.provider.getBalance(alice.address) - gas;
      expect(spent).to.equal(ethers.parseEther("0.01"));
    });

    it("Energy 不足时拒绝调用", async () => {
      const { c, creator, alice } = await deploy();
      const id = await registerBasic(c, creator);
      await c.connect(alice).unlockSkill(id, 1, { value: ONE });
      await expect(c.connect(alice).invokeSkill(id, ethers.id("z"))).to.be.revertedWith("LOW_ENERGY");
    });
  });

  describe("tokenURI 与注入防护", () => {
    it("技能名不能包含引号、反斜杠、尖括号", async () => {
      const { c, creator } = await deploy();
      for (const bad of ['a"b', "a\\b", "a<b", "a>b"]) {
        await expect(
          c.connect(creator).registerSkill(bad, 1, 5, ONE, 0, 0)
        ).to.be.revertedWith("BAD_NAME_CHAR");
      }
    });

    it("技能名长度受限", async () => {
      const { c, creator } = await deploy();
      await expect(c.connect(creator).registerSkill("", 1, 5, ONE, 0, 0)).to.be.revertedWith("BAD_NAME_LEN");
      await expect(
        c.connect(creator).registerSkill("x".repeat(49), 1, 5, ONE, 0, 0)
      ).to.be.revertedWith("BAD_NAME_LEN");
    });

    it("uri 返回可解析的全链上 metadata，含内联 SVG", async () => {
      const { c, creator } = await deploy();
      const id = await registerBasic(c, creator, "Solidity Scanner");

      const uri: string = await c.uri(id);
      expect(uri.startsWith("data:application/json;base64,")).to.equal(true);

      const json = JSON.parse(
        Buffer.from(uri.split(",")[1], "base64").toString("utf8")
      );
      expect(json.name).to.contain("Solidity Scanner");
      expect(json.image.startsWith("data:image/svg+xml;base64,")).to.equal(true);

      const svg = Buffer.from(json.image.split(",")[1], "base64").toString("utf8");
      expect(svg.startsWith("<svg")).to.equal(true);
      expect(svg).to.contain("Solidity Scanner");
      // 图像完全来自合约，不依赖 IPFS 或任何服务器
      expect(svg).to.not.contain("http");
    });
  });

  describe("版税", () => {
    it("默认 7% 归创作者", async () => {
      const { c, creator } = await deploy();
      const id = await registerBasic(c, creator);
      const [receiver, amount] = await c.royaltyInfo(id, ethers.parseEther("100"));
      expect(receiver).to.equal(creator.address);
      expect(amount).to.equal(ethers.parseEther("7"));
    });

    it("版税上限 10%", async () => {
      const { c, owner, creator } = await deploy();
      const id = await registerBasic(c, creator);
      await expect(c.connect(owner).setSkillRoyalty(id, 1500)).to.be.revertedWith("ROYALTY_TOO_HIGH");
    });
  });
});
