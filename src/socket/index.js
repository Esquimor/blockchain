const WebSocket = require("ws");
const { Server } = require("ws");
const Message = require("./Message");
const MessageType = require("./MessageType");
const { JSONToObject } = require("./utils");

class WebSocket {
  constructor(p2pPort, sockets = []) {
    this.sockets = sockets;
    this.p2pPort = p2pPort;
  }

  initP2PServer() {
    const server = new WebSocket.Server({ port: this.p2pPort });
    server.on("connection", ws => {
      initConnection(ws);
    });
    console.log("listening websocket p2p port on: " + this.p2pPort);
  }

  getSockets() {
    return this.sockets;
  }

  initConnection(ws) {
    this.sockets.push(ws);
    this.initMessageHandler(ws);
    this.initErrorHandler(ws);
    this.write(ws, this.queryChainLengthMsg());

    // query transactions pool only some time after chain query
    setTimeout(() => {
      this.broadcast(this.queryTransactionPoolMsg());
    }, 500);
  }
}

module.exports = WebSocket;
