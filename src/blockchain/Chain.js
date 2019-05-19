const SHA256 = require("crypto-js/sha256");

const BLOCK_GENERATION_INTERVAL = 2;

const DIFFICULTY_ADJUSTMENT_INTERVAL = 2;

class Chain {
  constructor() {
    this.chain = [];
    this.unspendTxOut = [];
  }

  createGenesisBlock() {
    return new Block(0, "0", 0, 0, []);
  }

  addBlockToChain(block) {
    if (!block.isValidBlock(this.getLastedBlock())) return false;
    this.chain.push(block);
    return true;
  }

  getLastedBlock() {
    return this.chain[this.chain.length - 1];
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

  replaceChain(newChain) {
    if (
      newChain.isValidChain() &&
      newChain.getAccumulatedDifficulty() > this.getAccumulatedDifficulty()
    ) {
      this.chain = newChain;
      return true;
    } else {
      return false;
    }
  }

  getAccumulatedDifficulty() {
    return this.chain
      .map(block => block.difficulty)
      .map(difficulty => Math.pow(2, difficulty))
      .reduce((a, b) => a + b);
  }

  mineBlock(transactions) {
    let nonce = 0;
    const latestBlock = this.getLastedBlock();
    const difficulty = this.getDifficulty();
    while (true) {
      const newBlock = new Block(
        latestBlock.index + 1,
        latestBlock.hash,
        nonce,
        difficulty,
        transactions
      );
      if (this.hashMatchesDifficulty(newBlock.hash, difficulty)) {
        return newBlock;
      }
      nonce++;
    }
  }

  mineAddBlock(transactions) {
    if (this.addBlockToChain(this.mineBlock(transactions))) {
      return true;
    } else {
      return false;
    }
  }

  getDifficulty() {
    const latestBlock = this.getLastedBlock();
    if (
      latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
      latestBlock.index !== 0
    ) {
      return getAdjustedDifficulty();
    } else {
      return latestBlock.difficulty;
    }
  }

  getAdjustedDifficulty() {
    const prevAdjustmentBlock = this.chain[
      this.chain.length - DIFFICULTY_ADJUSTMENT_INTERVAL
    ];
    const timeExpected =
      BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
      return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
      return prevAdjustmentBlock.difficulty - 1;
    } else {
      return prevAdjustmentBlock.difficulty;
    }
  }

  hashMatchesDifficulty(hash, difficulty) {
    const requiredPrefix = "0".repeat(difficulty);
    return hash.startsWith(requiredPrefix);
  }
}

module.exports = Chain;
