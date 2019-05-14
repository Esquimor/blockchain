import * as CryptoJS from "crypto-js";
import * as ecdsa from "elliptic";
import * as _ from "lodash";
import TxIn from "./TxIn";
import TxOut from "./TxOut";

const ec = new ecdsa.ec("secp256k1");

const COINBASE_AMOUNT = 50;
/**
 *
 */
class Transaction {
  /**
   *
   * @param {String} id
   * @param {TxIn[]} txIns
   * @param {TxOut[]} txOuts
   */
  constructor(id, txIns, txOuts) {
    this.id = id;
    this.txIns = txIns;
    this.txOuts = txOuts;
  }

  /**
   *
   * @param {Transaction} transaction
   *
   * @returns {String}
   */
  getTransactionId(transaction) {
    const txInContent = transaction.txIns
      .map(txIn => txIn.txOutId + txIn.txOutIndex)
      .reduce((a, b) => a + b, "");

    const txOutContent = transaction.txOuts
      .map(txOut => txOut.address + txOut.amount)
      .reduce((a, b) => a + b, "");

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
  }

  /**
   *
   * @param {Transaction} transaction
   * @param {UnspentTxOut[]} aUnspentTxOuts
   *
   * @returns {Boolean}
   */
  validateTransaction(transaction, aUnspentTxOuts) {
    if (getTransactionId(transaction) !== transaction.id) {
      console.log("invalid tx id: " + transaction.id);
      return false;
    }
    const hasValidTxIns = transaction.txIns
      .map(txIn => validateTxIn(txIn, transaction, aUnspentTxOuts))
      .reduce((a, b) => a && b, true);

    if (!hasValidTxIns) {
      console.log("some of the txIns are invalid in tx: " + transaction.id);
      return false;
    }

    const totalTxInValues = transaction.txIns
      .map(txIn => getTxInAmount(txIn, aUnspentTxOuts))
      .reduce((a, b) => a + b, 0);

    const totalTxOutValues = transaction.txOuts
      .map(txOut => txOut.amount)
      .reduce((a, b) => a + b, 0);

    if (totalTxOutValues !== totalTxInValues) {
      console.log(
        "totalTxOutValues !== totalTxInValues in tx: " + transaction.id
      );
      return false;
    }

    return true;
  }

  /**
   *
   * @param {Transaction[]} aTransactions
   * @param {UnspentTxOut[]} aUnspentTxOuts
   * @param {number} blockIndex
   *
   * @returns {Boolean}
   */
  validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex) {
    const coinbaseTx = aTransactions[0];
    if (!validateCoinbaseTx(coinbaseTx, blockIndex)) {
      console.log(
        "invalid coinbase transaction: " + JSON.stringify(coinbaseTx)
      );
      return false;
    }

    //check for duplicate txIns. Each txIn can be included only once
    const txIns = _(aTransactions)
      .map(tx => tx.txIns)
      .flatten()
      .value();

    if (hasDuplicates(txIns)) {
      return false;
    }

    // all but coinbase transactions
    const normalTransactions = aTransactions.slice(1);
    return normalTransactions
      .map(tx => validateTransaction(tx, aUnspentTxOuts))
      .reduce((a, b) => a && b, true);
  }

  /**
   *
   * @param {Transaction} transaction
   * @param {number} blockIndex
   *
   * @returns {Boolean}
   */
  validateCoinbaseTx(transaction, blockIndex) {
    if (transaction == null) {
      console.log(
        "the first transaction in the block must be coinbase transaction"
      );
      return false;
    }
    if (getTransactionId(transaction) !== transaction.id) {
      console.log("invalid coinbase tx id: " + transaction.id);
      return false;
    }
    if (transaction.txIns.length !== 1) {
      console.log("one txIn must be specified in the coinbase transaction");
      return;
    }
    if (transaction.txIns[0].txOutIndex !== blockIndex) {
      console.log("the txIn signature in coinbase tx must be the block height");
      return false;
    }
    if (transaction.txOuts.length !== 1) {
      console.log("invalid number of txOuts in coinbase transaction");
      return false;
    }
    if (transaction.txOuts[0].amount != COINBASE_AMOUNT) {
      console.log("invalid coinbase amount in coinbase transaction");
      return false;
    }
    return true;
  }

  /**
   *
   * @param {String} address
   * @param {Number} blockIndex
   *
   * @returns {Transaction}
   */
  getCoinbaseTransaction(address, blockIndex) {
    const t = new Transaction();
    const txIn = new TxIn();
    txIn.signature = "";
    txIn.txOutId = "";
    txIn.txOutIndex = blockIndex;

    t.txIns = [txIn];
    t.txOuts = [new TxOut(address, COINBASE_AMOUNT)];
    t.id = getTransactionId(t);
    return t;
  }

  /**
   *
   * @param {Transaction} transaction
   * @param {Number} txInIndex
   * @param {String} privateKey
   * @param {UnspentTxOut[]} aUnspentTxOuts
   *
   * @returns {string}
   */
  signTxIn(transaction, txInIndex, privateKey, aUnspentTxOuts) {
    const txIn = transaction.txIns[txInIndex];

    const dataToSign = transaction.id;
    const referencedUnspentTxOut = findUnspentTxOut(
      txIn.txOutId,
      txIn.txOutIndex,
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

module.exports = Transaction;
