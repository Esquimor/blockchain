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
router.post("/add", function(req, res, next) {});

module.exports = router;
