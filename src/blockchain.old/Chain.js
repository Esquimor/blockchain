const Block = require("./Block");

const BLOCK_GENERATION_INTERVAL = 10;
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

/**
 * BlockChain
 *
 * @public
 */
class Chain {
  /**
   * Init the Blockchain
   *
   * @public
   */
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.unspentTxOut = [];
  }

  /**
   * Init the first Block of a chain
   *
   * @private
   *
   * @returns {String}
   */
  createGenesisBlock() {
    return new Block([], "0", 0);
  }

  /**
   * Return this lastest Block
   *
   * @private
   *
   * @returns {Block}
   */
  previousBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a Block to the blockchain
   *
   * @public
   *
   * @param {Block} block
   */
  addBlock(block) {
    block.previousHash = this.previousBlock().hash;
    block.hash = block.calculateHash();
    this.chain.push(block);
  }

  /**
   * Replace the existing chain by a longest
   *
   * @public
   *
   * @param {Chain} newChain
   *
   * @returns {Boolean}
   */
  replaceChain(newChain) {
    if (newChain.isChainValid() && newChain.chain.length > this.chain.length) {
      this.chain = newChain.chain;
      return true;
    }
    return false;
  }

  /**
   * Replace the current unspentTxOut
   *
   * @param {UnspentTxOut[]} newUnspentTxOut
   */
  replaceUnspentTxOut(newUnspentTxOut) {
    this.unspentTxOut = newUnspentTxOut;
  }

  /**
   * Return the last block
   *
   * @returns {Block}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Verify if the chain is valid
   *
   * @public
   *
   * @returns {Boolean}
   */
  isChainValid() {
    /**
     * Verify if the genesis block is correct
     */
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    /**
     * Verify if eatch block of the chain is correct
     */
    for (let i = 1, length = this.block.length; i < length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.calculateHash()) {
        return false;
      }
    }

    return true;
  }

  /**
   * @returns {Number}
   */
  getDifficulty() {
    const latestBlock = this.latestBlock();
    if (
      latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
      latestBlock.index !== 0
    ) {
      return this.getAdjustedDifficulty();
    } else {
      return latestBlock.difficulty;
    }
  }

  /**
   * @returns {Number}
   */
  getAdjustedDifficulty() {
    const latestBlock = this.latestBlock();
    const prevAdjustmentBlock = this.chain[
      blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL
    ];
    const timeExpected =
      BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
      return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
      return prevAdjustmentBlock.difficulty - 1;
    } else {
      return prevAdjustmentBlock.difficulty;
    }
  }

  /**
   * @returns {Number}
   */
  getCurrentTimestamp() {
    return Math.round(new Date().getTime() / 1000);
  }

  /**
   *
   * @param {Transaction[]} blockData
   */
  generateRawNextBlock(blockData) {
    const previousBlock = this.getLatestBlock();
    const difficulty = this.getDifficulty();
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = getCurrentTimestamp();
    const newBlock = findBlock(
      nextIndex,
      previousBlock.hash,
      nextTimestamp,
      blockData,
      difficulty
    );
    if (this.addBlockToChain(newBlock)) {
      this.broadcastLatest();
      return newBlock;
    } else {
      return null;
    }
  }

  generateNextBlock() {
    const coinbaseTx = getCoinbaseTransaction(
      getPublicFromWallet(),
      getLatestBlock().index + 1
    );
    const blockData = [coinbaseTx].concat(getTransactionPool());
    return generateRawNextBlock(blockData);
  }

  /**
   *
   * @param {String} receiverAddress
   * @param {Number} amount
   */
  generatenextBlockWithTransaction(receiverAddress, amount) {
    if (!isValidAddress(receiverAddress)) {
      throw Error("invalid address");
    }
    if (typeof amount !== "number") {
      throw Error("invalid amount");
    }
    const coinbaseTx = getCoinbaseTransaction(
      getPublicFromWallet(),
      getLatestBlock().index + 1
    );
    const tx = createTransaction(
      receiverAddress,
      amount,
      getPrivateFromWallet(),
      getUnspentTxOuts(),
      getTransactionPool()
    );
    const blockData = [coinbaseTx, tx];
    return generateRawNextBlock(blockData);
  }

  /**
   *
   * @param {Number} index
   * @param {String} previousHash
   * @param {Number} timestamp
   * @param {Transaction[]} data
   * @param {Number} difficulty
   *
   * @returns {Block}
   */
  findBlock(index, previousHash, timestamp, data, difficulty) {
    let nonce = 0;
    while (true) {
      const hash = calculateHash(
        index,
        previousHash,
        timestamp,
        data,
        difficulty,
        nonce
      );
      if (hashMatchesDifficulty(hash, difficulty)) {
        return new Block(
          index,
          hash,
          previousHash,
          timestamp,
          data,
          difficulty,
          nonce
        );
      }
      nonce++;
    }
  }

  /**
   *
   * @param {String} publicKey
   */
  getAccountBalance(publicKey) {
    return getBalance(publicKey, this.getUnspentTxOuts());
  }

  /**
   *
   * @param {String} address
   * @param {Number} amount
   */
  sendTransaction(address, amount) {
    const tx = createTransaction(
      address,
      amount,
      getPrivateFromWallet(),
      getUnspentTxOuts(),
      getTransactionPool()
    );
    addToTransactionPool(tx, getUnspentTxOuts());
    broadCastTransactionPool();
    return tx;
  }
}

module.exports = Chain;
