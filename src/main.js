const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

// Env Variable
const httpPort = parseInt(process.env.HTTP_PORT) || 8001;
const p2pPort = parseInt(process.env.P2P_PORT) || 8301;

const initHttpServer = myHttpPort => {
  const app = express();
  app.use(bodyParser.json());

  // Route
  const indexRouter = require("./routes/index");
  const blockRouter = require("./routes/block");

  app.use("/", indexRouter);
  app.use("/block", blockRouter);

  // Start Server
  app.listen(myHttpPort, () => {
    console.log("Listening http on port: " + myHttpPort);
  });
};

initHttpServer(httpPort);
//initP2PServer(p2pPort);
//initWallet();
