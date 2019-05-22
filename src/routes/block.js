const express = require("express");
//const redis = require("../redis");
const blockchain = require("../blockchain");
const router = express.Router();
const WebSocket = require("./../socket/index");

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

  const validBlock = blockchain.mineAddBlockWithTransaction(
    privateKey,
    amount,
    addressReceving
  );
  if (validBlock) {
    WebSocket.broadcastLatest();
    res.json({ block: blockchain.getLastedBlock() });
  } else {
    res.status(400).send("Bad Block");
  }
});

module.exports = router;
