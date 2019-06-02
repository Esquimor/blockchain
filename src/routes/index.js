const express = require("express");
const router = express.Router();
const blockchain = require("../blockchain");
const websocket = require("../socket/index");

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.status(200).send(blockchain.chain);
});

router.post("/amount/add", function(req, res, next) {
  const { amount, addressReceving } = req.body;

  const validBlock = blockchain.mineAddBlockWithTransactionPayed(
    addressReceving,
    amount
  );
  if (validBlock) {
    websocket.broadcastLatest();
    res.status(200).send({
      block: blockchain.getLastedBlock()
    });
  } else {
    res.status(500).send("an error has occured");
  }
});

router.post("/addPeer", (req, res) => {
  websocket.connectToPeers(req.body.peer);
  res.status(200).send({
    p2p: process.env.P2P_PORT || 8301
  });
});

router.get("/listPeer", (req, res) => {
  res.status(200).send({
    peers: websocket.getSockets()
  });
});

module.exports = router;
