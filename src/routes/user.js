const express = require("express");
//const redis = require("../redis");
const blockchain = require("../blockchain");
const router = express.Router();

/**
 * Get all Blocks
 *
 * @returns {Block[]}
 */
router.get("/amount", function(req, res, next) {
  res.status(200).send({ amount: blockchain.getAmountUser(req.query.address) });
});

module.exports = router;
