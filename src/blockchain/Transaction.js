class Transaction {
  constructor(txIns, txOuts) {
    this.txIns = txIns;
    this.txOuts = txOuts;
    this.id = this.setTransactionId();
  }

  setTransactionId() {
    const txInContent = this.txIns
      .map(txIn => txIn.txOutId + txIn.txOutIndex)
      .reduce((a, b) => a + b, "");

    const txOutContent = this.txOuts
      .map(txOut => txOut.address + txOut.amount)
      .reduce((a, b) => a + b, "");

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
  }
}

module.exports = Transaction;
