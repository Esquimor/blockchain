const SHA256 = require("crypto-js/sha256");

/**
 * A Block
 */
class Block {
  /**
   * Create a Block
   * @param {Transaction[]} transactions
   * @param {String} previousHash
   */
  constructor(transactions, previousHash = "") {
    this.previousHash = previousHash;
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  /**
   * Calcul the hash of the block
   *
   * @return {String}
   */
  calculateHash() {
    return SHA256(
      this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }
}

module.exports = Block;
