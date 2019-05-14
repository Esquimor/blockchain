const SHA256 = require("crypto-js/sha256");
const { DIFFICUTY } = require("./const");

class Block {
  constructor(index, previousHash = "", transactions, nonce) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = new Date().toString();
    this.transactions = transactions;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(
      this.previousHash +
        this.timestamp +
        this.nonce +
        JSON.stringify(this.transactions)
    ).toString();
  }

  isValidBlock(previousBlock) {
    if (this.previousHash !== this.previousBlock.hash) return false;

    if (this.index - 1 !== this.previousBlock.index) return false;

    if (this.hash !== this.calculateHash()) return false;

    if (newBlock.hash.slice(DIFFICUTY) != 0) return false;
    return true;
  }
}
module.exports = Block;
