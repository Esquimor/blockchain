class Transaction {
  constructor(txIns, txOuts) {
    this.txIns = txIns;
    this.txOuts = txOuts;
    this.id = null;
  }

  getTransactionId() {
    const txInContent = this.txIns
      .map(txIn => txIn.txOutId + txIn.txOutIndex)
      .reduce((a, b) => a + b, "");

    const txOutContent = this.txOuts
      .map(txOut => txOut.address + txOut.amount)
      .reduce((a, b) => a + b, "");

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
  }

  validateTransaction(aUnspentTxOuts) {
    if (!this.isValidTransactionStructure()) {
      return false;
    }

    if (this.getTransactionId() !== this.id) {
      console.log("invalid tx id: " + this.id);
      return false;
    }
    const hasValidTxIns = this.txIns
      .map(txIn => validateTxIn(txIn, this, aUnspentTxOuts))
      .reduce((a, b) => a && b, true);

    if (!hasValidTxIns) {
      console.log("some of the txIns are invalid in tx: " + this.id);
      return false;
    }

    const totalTxInValues = this.txIns
      .map(txIn => this.getTxInAmount(txIn, aUnspentTxOuts))
      .reduce((a, b) => a + b, 0);

    const totalTxOutValues = this.txOuts
      .map(txOut => txOut.amount)
      .reduce((a, b) => a + b, 0);

    if (totalTxOutValues !== totalTxInValues) {
      console.log("totalTxOutValues !== totalTxInValues in tx: " + this.id);
      return false;
    }

    return true;
  }

  validateCoinbaseTx(blockIndex) {
    if (this.getTransactionId() !== this.transaction.id) {
      console.log("invalid coinbase tx id: " + this.transaction.id);
      return false;
    }
    if (this.transaction.txIns.length !== 1) {
      console.log("one txIn must be specified in the coinbase transaction");
      return;
    }
    if (this.transaction.txIns[0].txOutIndex !== blockIndex) {
      console.log("the txIn signature in coinbase tx must be the block height");
      return false;
    }
    if (this.transaction.txOuts.length !== 1) {
      console.log("invalid number of txOuts in coinbase transaction");
      return false;
    }
    /*if (this.transaction.txOuts[0].amount !== COINBASE_AMOUNT) {
      console.log("invalid coinbase amount in coinbase transaction");
      return false;
    }*/
    return true;
  }
}

module.exports = Transaction;
