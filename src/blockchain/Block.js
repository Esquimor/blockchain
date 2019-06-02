const SHA256 = require("crypto-js/sha256");

class Block {
  constructor(
    index,
    timestamp,
    previousHash,
    nonce,
    difficulty,
    transactions,
    node
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.transactions = transactions;
    this.node = node;
    this.hash = generateHash(
      this.index,
      this.timestamp,
      this.previousHash,
      this.nonce,
      this.difficulty,
      this.transactions
    );
  }
}

const generateHash = (
  index,
  timestamp,
  previousHash,
  nonce,
  difficulty,
  transactions
) => {
  return SHA256(
    index +
      previousHash +
      timestamp +
      nonce +
      difficulty +
      JSON.stringify(transactions)
  ).toString();
};

isValidBlock = (currentBlock, previousBlock) => {
  if (previousBlock.index + 1 !== currentBlock.index) return false;
  if (previousBlock.timestamp > currentBlock.timestamp) return false;
  if (previousBlock.hash !== currentBlock.previousHash) return false;
  if (
    currentBlock.hash !==
    generateHash(
      currentBlock.index,
      currentBlock.timestamp,
      currentBlock.previousHash,
      currentBlock.nonce,
      currentBlock.difficulty,
      currentBlock.transactions
    )
  )
    return false;
  return true;
};

module.exports = { Block, isValidBlock };
