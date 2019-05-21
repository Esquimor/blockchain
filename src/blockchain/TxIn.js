const { ec } = require("elliptic");
const EC = new ec("secp256k1");
const { getPublicKey, toHexString } = require("./utils");

class TxIn {
  constructor(txOutId, txOutIndex) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.signature = null;
  }

  signTxIn(dataToSign, privateKey, aUnspentTxOuts) {
    const referencedUnspentTxOut = this.findUnspentTxOut(aUnspentTxOuts);
    if (referencedUnspentTxOut == null) {
      return null;
    }
    const referencedAddress = referencedUnspentTxOut.address;

    if (getPublicKey(privateKey) !== referencedAddress) {
      return null;
    }
    const key = EC.keyFromPrivate(privateKey, "hex");
    const signature = toHexString(key.sign(dataToSign).toDER());

    return signature;
  }

  findUnspentTxOut(aUnspentTxOuts) {
    return aUnspentTxOuts.find(
      uTxO =>
        uTxO.txOutId === this.txOutId && uTxO.txOutIndex === this.txOutIndex
    );
  }

  getTxInAmount(aUnspentTxOuts) {
    return yhis.findUnspentTxOut(aUnspentTxOuts).amount;
  }
}

module.exports = TxIn;
