const SHA256 = require("crypto-js/sha256");
const { DIFFICUTY } = require("./const");

class Block {
  constructor(index, previousHash = "", transactions, nonce) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = new Date().toString();
    this.transactions = transactions;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(
      this.previousHash +
        this.timestamp +
        this.nonce +
        JSON.stringify(this.transactions)
    ).toString();
  }

  isValidBlock(previousBlock) {
    if (this.previousHash !== previousBlock.hash) return false;

    if (this.index - 1 !== previousBlock.index) return false;

    if (this.hash !== this.calculateHash()) return false;

    if (newBlock.hash.slice(DIFFICUTY) != 0) return false;
    return true;
  }

  validateBlockTransactions(aUnspentTxOuts) {
    const coinbaseTx = this.transactions[0];
    if (!coinbaseTx.validateCoinbaseTx(blockIndex)) {
      return false;
    }

    // check for duplicate txIns. Each txIn can be included only once
    const txIns = _(this.transactions)
      .map(tx => tx.txIns)
      .flatten()
      .value();

    if (this.hasDuplicates(txIns)) {
      return false;
    }

    // all but coinbase transactions
    const normalTransactions = this.transactions.slice(1);
    return normalTransactions
      .map(tx => tx.validateTransaction(aUnspentTxOuts))
      .reduce((a, b) => a && b, true);
  }

  hasDuplicates(txIns) {
    const groups = _.countBy(txIns, txIn => txIn.txOutId + txIn.txOutIndex);
    return _(groups)
      .map((value, key) => {
        if (value > 1) {
          return true;
        } else {
          return false;
        }
      })
      .includes(true);
  }
}
module.exports = Block;
