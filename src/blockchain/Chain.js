const Block = require("./Block");

/**
 * BlockChain
 */
class Chain {
  /**
   * Init the Blockchain
   */
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  /**
   * Init the first Block of a chain
   *
   * @returns {String}
   */
  createGenesisBlock() {
    return new Block([], "0");
  }

  /**
   * Return this lastest Block
   *
   * @returns {Block}
   */
  previousBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a Block to the blockchain
   *
   * @param {Block} block
   */
  addBlock(block) {
    block.previousHash = this.previousBlock().hash;
    block.hash = block.calculateHash();
    this.chain.push(block);
  }

  /**
   * Verify if the chain is valid
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
}

module.exports = Chain;
