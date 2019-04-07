const SHA256 = require("crypto-js/sha256");

class Transaction {
  /**
   * Create a Transaction
   *
   * @param {String} fromAdress
   * @param {String} toAdress
   * @param {Number} amount
   */
  constructor(fromAdress, toAdress, amount) {
    this.fromAdress = fromAdress;
    this.toAdress = toAdress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  /**
   * Calcul the hash of the transaction
   *
   * @returns {String}
   */
  calculateHash() {
    return SHA256(
      this.fromAddress + this.toAddress + this.amount + this.timestamp
    ).toString();
  }
}

module.exports = Transaction;
