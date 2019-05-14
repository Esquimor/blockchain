const ec = require("elliptic");
const fs = require("fs");
const existsSync = fs.existsSync();
const readFileSync = fs.readFileSync();
const unlinkSync = fs.unlinkSync();
const writeFileSync = fs.writeFileSync();
const _ = require("lodash");

const EC = new ec("secp256k1");
const privateKeyLocation = process.env.PRIVATE_KEY || "node/wallet/private_key";

/**
 * Wallet
 *
 * @public
 */
class Wallet {
  /**
   * Init the wallet with a private key
   *
   * @public
   */
  constructor() {
    if (existsSync(privateKeyLocation)) {
      return;
    }

    writeFileSync(privateKeyLocation, generatePrivateKey());
  }

  /**
   * Delete the wallet
   *
   * @public
   */
  delete() {
    if (existsSync(privateKeyLocation)) {
      unlinkSync(privateKeyLocation);
    }
  }

  /**
   * Return the private key of the wallet
   *
   * @public
   *
   * @returns {String}
   */
  getPrivateFromWallet() {
    return readFileSync(privateKeyLocation, "utf8").toString();
  }

  /**
   * Return the public key of the wallet
   *
   * @public
   *
   * @returns {String}
   */
  getPublicFromWallet() {
    const privateKey = this.getPrivateFromWallet();
    const key = EC.keyFromPrivate(privateKey, "hex");
    return key.getPublic().encode("hex");
  }

  /**
   * Generate the private key
   *
   * @public
   *
   * @returns {String}
   */
  generatePrivateKey() {
    const keyPair = EC.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
  }
}

module.exports = Wallet;
