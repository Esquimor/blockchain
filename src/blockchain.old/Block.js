const SHA256 = require("crypto-js/sha256");
const DIFFICULTY = 2;

/**
 * A Block
 *
 * @public
 */
class Block {
  /**
   * Create a Block
   *
   * @public
   *
   * @param {Transaction[]} transactions
   * @param {String} previousHash
   * @param {Number} nonce
   */
  constructor(transactions, previousHash = "", nonce) {
    this.previousHash = previousHash;
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = this.calculateHash();
    this.difficulty = DIFFICULTY;
    this.nonce = nonce;
  }

  /**
   * Calcul the hash of the block
   *
   * @public
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

  /**
   * Mine a block
   *
   * @param {Number} difficulty
   */
  mineblock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

module.exports = Block;
