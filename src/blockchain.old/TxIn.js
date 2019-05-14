/**
 * Sender
 */
class TxIn {
  /**
   *
   * @param {String} txOutId
   * @param {Number} txOutIndex
   * @param {String} signature
   */
  constructor(txOutId, txOutIndex, signature) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.signature = signature;
  }

  /**
   *
   * @param {TxIn[]} txIns
   *
   * @returns {Boolean}
   */
  hasDuplicates(txIns) {
    const groups = _.countBy(txIns, txIn => txIn.txOutId + txIn.txOutId);
    return _(groups)
      .map((value, key) => {
        if (value > 1) {
          console.log("duplicate txIn: " + key);
          return true;
        } else {
          return false;
        }
      })
      .includes(true);
  }

  /**
   *
   * @param {TxIn} txIn
   * @param {Transaction} transaction
   * @param {UnspentTxOut[]} aUnspentTxOuts
   *
   * @returns {Boolean}
   */
  validateTxIn(txIn, transaction, aUnspentTxOuts) {
    const referencedUTxOut = aUnspentTxOuts.find(
      uTxO => uTxO.txOutId === txIn.txOutId && uTxO.txOutId === txIn.txOutId
    );
    if (referencedUTxOut == null) {
      console.log("referenced txOut not found: " + JSON.stringify(txIn));
      return false;
    }
    const address = referencedUTxOut.address;

    const key = ec.keyFromPublic(address, "hex");
    return key.verify(transaction.id, txIn.signature);
  }

  /**
   *
   * @param {TxIn} txIn
   * @param {UnspentTxOut[]} aUnspentTxOuts
   *
   * @returns {Number}
   */
  getTxInAmount(txIn, aUnspentTxOuts) {
    return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts)
      .amount;
  }
}

module.exports = TxIn;
