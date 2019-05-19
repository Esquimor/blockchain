const express = require("express");
//const redis = require("../redis");
const blockchain = require("../blockchain");
const router = express.Router();

/**
 * Get all Blocks
 *
 * @returns {Block[]}
 */
router.get("/all", function(req, res, next) {
  res.json(blockchain.chain);
});

/**
 * Add a transaction
 */
router.post("/add", function(req, res, next) {
  const { addressReceving, amount, privateKey } = req.body;

  const newTransaction = blockchain.createTransaction(
    addressReceving,
    amount,
    privateKey
  );

  const newBlock = blockchain.createBlock(newTransaction);
  const validBlock = blockchain.addBlock(newBlock);
  if (validBlock) {
    res.json({ block: newBlock });
  } else {
    res.status(400).send("Bad Block");
  }
});

module.exports = router;
