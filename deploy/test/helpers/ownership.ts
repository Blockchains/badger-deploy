import { BadgerSystem } from "../../BadgerSystem"
import { Signer } from "ethers"
import { expect } from "chai"

export async function verifyOwnershipPermissions(badger: BadgerSystem, ownerAddress: string, badActor: Signer) {
    const badActorAddress = await badActor.getAddress()
  
    await expect(await badger.diggCore.diggToken.owner()).to.be.equal(ownerAddress)
  
    await expect(badger.diggCore.diggToken.connect(badActor).transferOwnership(badActorAddress)).to.be.reverted
    await expect(badger.diggCore.orchestrator.connect(badActor).transferOwnership(badActorAddress)).to.be.reverted
    await expect(badger.diggCore.supplyPolicy.connect(badActor).transferOwnership(badActorAddress)).to.be.reverted
    await expect(badger.diggOracles.marketMedianOracle.connect(badActor).transferOwnership(badActorAddress)).to.be
      .reverted
    await expect(badger.diggOracles.cpiMedianOracle.connect(badActor).transferOwnership(badActorAddress)).to.be.reverted
  }