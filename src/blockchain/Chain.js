const Transaction = require("./Transaction");
const TxIn = require("./TxIn");
const TxOut = require("./TxOut");
const { Block, isValidBlock } = require("./Block");
const UnspentTxOut = require("./UnspendTxOut");
const { getPublicKey } = require("./utils");

const BLOCK_GENERATION_INTERVAL = 1;
const DIFFICULTY_ADJUSTMENT_INTERVAL = 1;
const COINBASE_AMOUNT = 5;

class Chain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.unspendTxOut = [];
  }

  createGenesisBlock() {
    return new Block(0, "0", "0", 0, 0, []);
  }

  addBlockToChain(block) {
    if (!isValidBlock(block, this.getLastedBlock())) return false;
    const retVal = this.updateUnspentTxOuts(
      block.transactions,
      this.unspendTxOut
    );
    if (retVal === null) return false;
    this.unspendTxOut = retVal;
    this.chain.push(block);
    return true;
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
        uTxO =>
          !this.findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)
      )
      .concat(newUnspentTxOuts);
    return resultingUnspentTxOuts;
  }

  findUnspentTxOut(transactionId, index, aUnspentTxOuts) {
    return aUnspentTxOuts.find(
      uTxO => uTxO.txOutId === transactionId && uTxO.txOutIndex === index
    );
  }

  getLastedBlock() {
    return this.chain[this.chain.length - 1];
  }

  isValidChain(chain) {
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(chain[0])) {
      return false;
    }

    for (let i = 1, length = chain.length; i < length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (!isValidBlock(currentBlock, previousBlock)) {
        return false;
      }
    }

    return true;
  }

  replaceChain(newChain) {
    if (
      this.isValidChain(newChain) &&
      this.getAccumulatedDifficulty(newChain) >
        this.getAccumulatedDifficulty(this.chain)
    ) {
      this.chain = newChain;
      return true;
    } else {
      return false;
    }
  }

  getAccumulatedDifficulty(chain) {
    return chain
      .map(block => block.difficulty)
      .map(difficulty => Math.pow(2, difficulty))
      .reduce((a, b) => a + b);
  }

  mineBlock(transactions) {
    let nonce = 0;
    const latestBlock = this.getLastedBlock();
    let difficulty = this.getDifficulty();
    if (difficulty < 0) difficulty = 0;
    while (true) {
      const newBlock = new Block(
        latestBlock.index + 1,
        new Date().getTime(),
        latestBlock.hash,
        nonce,
        difficulty,
        transactions
      );
      if (this.hashMatchesDifficulty(newBlock.hash, difficulty)) {
        return newBlock;
      }
      nonce++;
    }
  }

  mineAddBlock(transactions) {
    if (this.addBlockToChain(this.mineBlock(transactions))) {
      return true;
    } else {
      return false;
    }
  }

  mineAddBlockWithTransaction(senderPrivateKey, amount, receiverAddress) {
    const coinbaseTx = this.getCoinbaseTransaction(
      process.env.SERVER_KEY,
      this.getLastedBlock().index + 1
    );
    const tx = this.createTransaction(
      receiverAddress,
      amount,
      senderPrivateKey,
      this.unspendTxOut
    );
    return this.mineAddBlock([coinbaseTx, tx]);
  }

  createTransaction(receiverAddress, amount, privateKey, unspendTxOut) {
    const senderAddress = getPublicKey(privateKey);
    const senderUnspendTxOut = unspendTxOut.filter(
      u => u.address === senderAddress
    );

    let { listUnspentTxOut, leftOverAmount } = this.findAmountUnspendTxOut(
      amount,
      senderUnspendTxOut
    );
    if (listUnspentTxOut === null) {
      return false;
    }
    const txIns = [];
    for (const includedUnspentTxOut of listUnspentTxOut) {
      txIns.push(
        new TxIn(includedUnspentTxOut.txOutId, includedUnspentTxOut.txOutIndex)
      );
    }

    const tx = new Transaction();
    tx.txIns = txIns;
    tx.txOuts = this.createTxOuts(
      receiverAddress,
      senderAddress,
      amount,
      leftOverAmount
    );
    tx.id = tx.generateId();

    tx.txIns = tx.txIns.map(txIn => {
      txIn.signature = txIn.signTxIn(tx.id, privateKey, unspendTxOut);
      return txIn;
    });

    return tx;
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

  findAmountUnspendTxOut(amount, unspendTxOuts) {
    let currentAmount = 0;
    let listUnspentTxOut = [];
    for (const unspendTxOut of unspendTxOuts) {
      listUnspentTxOut.push(unspendTxOut);
      currentAmount = currentAmount + unspendTxOut.amount;
      if (currentAmount >= amount) {
        const leftOverAmount = currentAmount - amount;
        return { listUnspentTxOut, leftOverAmount };
      }
    }

    return {
      listUnspentTxOut: null
    };
  }

  mineAddBlockWithTransactionPayed(receiverAddress, amount) {
    const txIns = [
      {
        signature: "",
        txOutId: "",
        txOutIndex: this.getLastedBlock().index + 1
      }
    ];
    const txOuts = [
      {
        address: receiverAddress,
        amount: amount
      }
    ];
    const tx = new Transaction();
    tx.txIns = txIns;
    tx.txOuts = txOuts;
    tx.id = tx.generateId();
    return this.mineAddBlock([tx]);
  }

  getCoinbaseTransaction(address, blockIndex) {
    const t = new Transaction();
    const txIn = new TxIn("", blockIndex);
    txIn.signature = "";

    t.txIns = [txIn];
    t.txOuts = [new TxOut(address, COINBASE_AMOUNT)];
    t.id = t.generateId();
    return t;
  }

  getDifficulty() {
    const latestBlock = this.getLastedBlock();
    if (
      latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
      latestBlock.index !== 0
    ) {
      return this.getAdjustedDifficulty();
    } else {
      return latestBlock.difficulty;
    }
  }

  getAdjustedDifficulty() {
    const prevAdjustmentBlock = this.chain[
      this.chain.length - DIFFICULTY_ADJUSTMENT_INTERVAL
    ];
    const timeExpected =
      BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken =
      this.getLastedBlock().timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
      return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
      return prevAdjustmentBlock.difficulty - 1;
    } else {
      return prevAdjustmentBlock.difficulty;
    }
  }

  hashMatchesDifficulty(hash, difficulty) {
    const requiredPrefix = "0".repeat(difficulty);
    return hash.startsWith(requiredPrefix);
  }

  getAmountUser(address) {
    return this.unspendTxOut
      .filter(b => b.address === address)
      .reduce((a, b) => a + b.amount, 0);
  }
}

module.exports = Chain;
