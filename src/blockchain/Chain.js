const Block = require("./Block");
const { DIFFICUTY } = require("./const");

class Chain {
  constructor() {
    this.chain = [this.genesisBlock()];
  }

  genesisBlock() {
    return new Block(0, "0", [], 0);
  }

  isValidChain() {
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    for (let i = 1, length = this.block.length; i < length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.isValidBlock(previousBlock)) {
        return false;
      }
    }

    return true;
  }

  latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  getChain() {
    return this.chain;
  }

  createBlock(transaction) {
    let nonce = 0;
    while (true) {
      const newBlock = new Block(
        this.latestBlock.index,
        this.latestBlock.hash,
        transaction,
        nonce
      );
      if (newBlock.hash.slice(DIFFICUTY) == 0) {
        return newBlock;
      }
      nonce++;
    }
  }

  addBlock(block) {
    if (block.isValidBlock(this.latestBlock())) {
      this.chain.push(block);
      return true;
    }
    return false;
  }

  remplaceChain(remplacementChain) {
    if (
      remplacementChain.isValidChain() &&
      remplacementChain.length > this.chain
    ) {
      this.chain = remplacementChain;
      return true;
    }
    return false;
  }
}

module.exports = Chain;
