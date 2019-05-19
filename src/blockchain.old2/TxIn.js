class TxIn {
  constructor(txOutId, txOutIndex, transactionId, privateKey, aUnspentTxOuts) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.signature = this.signTxIn(transactionId, privateKey, aUnspentTxOuts);
  }

  signTxIn(transaction, privateKey, aUnspentTxOuts) {
    const dataToSign = transaction.id;
    const referencedUnspentTxOut = this.findUnspentTxOut(aUnspentTxOuts);
    if (referencedUnspentTxOut == null) {
      console.log("could not find referenced txOut");
      throw Error();
    }
    const referencedAddress = referencedUnspentTxOut.address;
    if (getPublicKey(privateKey) !== referencedAddress) {
      return false;
    }
    const key = ec.keyFromPrivate(privateKey, "hex");
    this.signature = toHexString(key.sign(dataToSign).toDER());
    return true;
  }

  getTxInAmount(aUnspentTxOuts) {
    return this.findUnspentTxOut(aUnspentTxOuts).amount;
  }

  findUnspentTxOut(aUnspentTxOuts) {
    return aUnspentTxOuts.find(
      uTxO =>
        uTxO.txOutId === this.txOutId && uTxO.txOutIndex === this.txOutIndex
    );
  }

  validateTxIn(transaction, aUnspentTxOuts) {
    const referencedUTxOut = aUnspentTxOuts.find(
      uTxO =>
        uTxO.txOutId === this.txOutId && uTxO.txOutIndex === this.txOutIndex
    );
    if (referencedUTxOut == null) {
      console.log("referenced txOut not found: " + JSON.stringify(this));
      return false;
    }
    const address = referencedUTxOut.address;

    const key = ec.keyFromPublic(address, "hex");
    const validSignature = key.verify(transaction.id, this.signature);
    if (!validSignature) {
      console.log(
        "invalid txIn signature: %s txId: %s address: %s",
        this.signature,
        transaction.id,
        referencedUTxOut.address
      );
      return false;
    }
    return true;
  }
}

module.exports = TxIn;
