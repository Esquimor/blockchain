class TxIn {
  constructor(txOutId, txOutIndex) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.signature = null;
  }

  signTxIn(transaction, privateKey, aUnspentTxOuts) {
    const dataToSign = transaction.id;
    const referencedUnspentTxOut = findUnspentTxOut(
      this.txOutId,
      this.txOutIndex,
      aUnspentTxOuts
    );
    if (referencedUnspentTxOut == null) {
      console.log("could not find referenced txOut");
      throw Error();
    }
    const referencedAddress = referencedUnspentTxOut.address;
    if (getPublicKey(privateKey) !== referencedAddress) {
      console.log(
        "trying to sign an input with private" +
          " key that does not match the address that is referenced in txIn"
      );
      throw Error();
    }
    const key = ec.keyFromPrivate(privateKey, "hex");
    const signature = toHexString(key.sign(dataToSign).toDER());
    return signature;
  }
}

module.exports = TxIn;
