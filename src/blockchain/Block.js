class Block {
  constructor(index, previousHash, nonce, difficulty, transactions) {
    this.index = index;
    this.timestamp = new Date().toString();
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.transactions = transactions;
    this.hash = this.generateHash();
  }

  generateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        this.nonce +
        this.difficulty +
        JSON.stringify(this.transactions)
    ).toString();
  }

  isValidBlock(previousBlock) {
    if (previousBlock.index + 1 !== this.index) return false;
    if (previousBlock.timestamp > this.timestamp) return false;
    if (previousBlock.hash !== this.previousHash) return false;
    if (this.hash !== this.generateHash()) return false;
    return true;
  }
}

module.exports = Block;
