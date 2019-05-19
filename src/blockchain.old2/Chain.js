const Block = require("./Block");
const { DIFFICUTY } = require("./const");
const { ec } = require("elliptic");
const EC = new ec("secp256k1");

class Chain {
  constructor() {
    this.chain = [this.genesisBlock()];
    this.unspentTxOuts = [];
  }

  genesisBlock() {
    return new Block(0, "0", [], 0);
  }

  isValidChain() {
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    for (let i = 1, length = this.block.length; i < length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.isValidBlock(previousBlock)) {
        return false;
      }
    }

    return true;
  }

  latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  getChain() {
    return this.chain;
  }

  createBlock(transaction) {
    let nonce = 0;
    while (true) {
      const newBlock = new Block(
        this.latestBlock.index,
        this.latestBlock.hash,
        transaction,
        nonce
      );
      if (newBlock.hash.slice(DIFFICUTY) == 0) {
        return newBlock;
      }
      nonce++;
    }
  }

  addBlock(block) {
    if (block.isValidBlock(this.latestBlock())) {
      this.chain.push(block);
      return true;
    }
    return false;
  }

  remplaceChain(remplacementChain) {
    if (
      remplacementChain.isValidChain() &&
      remplacementChain.length > this.chain
    ) {
      this.chain = remplacementChain;
      return true;
    }
    return false;
  }

  updateUnspentTxOuts(aTransactions, aUnspentTxOuts) {
    const newUnspentTxOuts = aTransactions
      .map(t => {
        return t.txOuts.map(
          (txOut, index) =>
            new UnspentTxOut(t.id, index, txOut.address, txOut.amount)
        );
      })
      .reduce((a, b) => a.concat(b), []);

    const consumedTxOuts = aTransactions
      .map(t => t.txIns)
      .reduce((a, b) => a.concat(b), [])
      .map(txIn => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, "", 0));

    const resultingUnspentTxOuts = aUnspentTxOuts
      .filter(
        uTxO => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)
      )
      .concat(newUnspentTxOuts);

    return resultingUnspentTxOuts;
  }

  processTransactions(aTransactions, aUnspentTxOuts, blockIndex) {
    if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
      console.log("invalid block transactions");
      return null;
    }
    return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
  }

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

  getPublicKey(aPrivateKey) {
    return EC.keyFromPrivate(aPrivateKey, "hex")
      .getPublic()
      .encode("hex");
  }

  createTransaction(receiverAddress, amount, privateKey) {
    const publicKey = this.getPublicKey(privateKey);
    const myUnspentTxOutsA = this.unspentTxOuts.filter(
      uTxO => uTxO.address === publicKey
    );

    const { includedUnspentTxOuts, leftOverAmount } = this.findTxOutsForAmount(
      amount,
      myUnspentTxOutsA
    );
    // Create Transaction
    const tx = new Transaction();

    // Include TxIn
    tx.txIns = includedUnspentTxOuts.map(unspentTxOut => {
      const txIn = new TxIn();
      txIn.txOutId = unspentTxOut.txOutId;
      txIn.txOutIndex = unspentTxOut.txOutIndex;
      return txIn;
    });

    // Include TxOut
    tx.txOuts = this.createTxOuts(
      receiverAddress,
      publicKey,
      amount,
      leftOverAmount
    );
    tx.id = tx.getTransactionId();

    // Sign TxIn
    tx.txIns = tx.txIns.map(txIn => {
      txIn.signature = txIn.signTxIn(tx, privateKey, unspentTxOuts);
      return txIn;
    });

    return tx;
  }

  findTxOutsForAmount(amount, myUnspentTxOuts) {
    let currentAmount = 0;
    const includedUnspentTxOuts = [];
    for (const myUnspentTxOut of myUnspentTxOuts) {
      includedUnspentTxOuts.push(myUnspentTxOut);
      currentAmount = currentAmount + myUnspentTxOut.amount;
      if (currentAmount >= amount) {
        const leftOverAmount = currentAmount - amount;
        return { includedUnspentTxOuts, leftOverAmount };
      }
    }

    throw Error("An error has occured");
  }

  createTxOuts(receiverAddress, myAddress, amount, leftOverAmount) {
    const txOut1 = new TxOut(receiverAddress, amount);
    if (leftOverAmount === 0) {
      return [txOut1];
    } else {
      const leftOverTx = new TxOut(myAddress, leftOverAmount);
      return [txOut1, leftOverTx];
    }
  }
}

module.exports = Chain;
