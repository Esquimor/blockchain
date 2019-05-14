/**
 *
 */
class UnspentTxOut {
  /**
   *
   * @param {String} txOutId
   * @param {Number} txOutIndex
   * @param {String} address
   * @param {Number} amount
   */
  constructor(txOutId, txOutIndex, address, amount) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.address = address;
    this.amount = amount;
  }

  /**
   *
   * @param {String} transactionId
   * @param {Number} index
   * @param {UnspentTxOut[]} aUnspentTxOuts
   *
   * @returns {UnspentTxOut}
   */
  findUnspentTxOut(transactionId, index, aUnspentTxOuts) {
    return aUnspentTxOuts.find(
      uTxO => uTxO.txOutId === transactionId && uTxO.txOutIndex === index
    );
  }
}
