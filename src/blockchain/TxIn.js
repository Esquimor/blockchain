const { ec } = require("elliptic");
const EC = new ec("secp256k1");
const { getPublicKey, toHexString } = require("./utils");

class TxIn {
  constructor(txOutId, txOutIndex) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.signature = null;
  }
}

module.exports = TxIn;
