const SHA256 = require("crypto-js/sha256");
const TxIn = require("./TxIn");
const TxOut = require("./TxOut");

class Transaction {
  generateId() {
    const txInContent = this.txIns
      .map(txIn => txIn.txOutId + txIn.txOutIndex)
      .reduce((a, b) => a + b, "");

    const txOutContent = this.txOuts
      .map(txOut => txOut.address + txOut.amount)
      .reduce((a, b) => a + b, "");

    return SHA256(txInContent + txOutContent).toString();
  }

  validTransaction() {
    if (this.id !== this.generateId()) return false;
    return true;
  }
}

module.exports = Transaction;
