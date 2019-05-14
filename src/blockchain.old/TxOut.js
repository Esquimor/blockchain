/**
 * Recever
 */
class TxOut {
  /**
   * Created an Transaction Output
   * @param {String} address
   * @param {Number} amount
   */
  constructor(address, amount) {
    this.address = address;
    this.amount = amount;
  }
}

module.exports = TxOut;
