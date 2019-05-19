const express = require("express");
const router = express.Router();
const blockchain = require("../blockchain");

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

router.get("/amount/add", function(req, res, next) {
  const { amount, addressReceving } = req.body;

  const newTransaction = blockchain.createTransaction(
    addressReceving,
    amount,
    privateKey
  );
});

module.exports = router;
