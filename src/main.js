const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const dotenv = require("dotenv");
const cors = require("cors");

// Env Variable
dotenv.config();
const httpPort = parseInt(process.env.HTTP_PORT) || 8001;

const initHttpServer = myHttpPort => {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  // Route
  const indexRouter = require("./routes/index");
  const blockRouter = require("./routes/block");
  const userRouter = require("./routes/user");

  app.use("/", indexRouter);
  app.use("/block", blockRouter);
  app.use("/user", userRouter);

  // Start Server
  app.listen(myHttpPort, () => {
    console.log("Listening http on port: " + myHttpPort);
  });
};

initHttpServer(httpPort);
//initP2PServer(p2pPort);
//initWallet();
