const WebSocket = require("ws");
//const { Server } = require("ws");
//const Message = require("./Message");
const MessageType = require("./MessageType");
const { JSONToObject } = require("./utils");

const blockchain = require("../blockchain");

class Websocket {
  constructor(p2pPort, sockets = []) {
    this.sockets = sockets;
    this.p2pPort = p2pPort;
    this.initP2PServer();
  }

  initP2PServer() {
    const server = new WebSocket.Server({ port: this.p2pPort });
    server.on("connection", ws => {
      this.initConnection(ws);
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
  }

  initMessageHandler(ws) {
    ws.on("message", data => {
      try {
        const message = JSONToObject(data);
        if (message === null) {
          return;
        }
        switch (message.type) {
          case MessageType.QUERY_LATEST:
            this.write(ws, this.responseLatestMsg());
            break;
          case MessageType.QUERY_ALL:
            this.write(ws, this.responseChainMsg());
            break;
          case MessageType.RESPONSE_BLOCKCHAIN:
            const receivedBlocks = JSONToObject(message.data);
            if (receivedBlocks === null) {
              break;
            }
            this.handleBlockchainResponse(receivedBlocks);
            break;
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

  write(ws, message) {
    ws.send(JSON.stringify(message));
  }

  broadcast(message) {
    this.sockets.forEach(socket => this.write(socket, message));
  }

  queryChainLengthMsg() {
    return { type: MessageType.QUERY_LATEST, data: null };
  }

  queryAllMsg() {
    return { type: MessageType.QUERY_ALL, data: null };
  }

  responseChainMsg() {
    return {
      type: MessageType.RESPONSE_BLOCKCHAIN,
      data: JSON.stringify(blockchain.chain)
    };
  }

  responseLatestMsg() {
    return {
      type: MessageType.RESPONSE_BLOCKCHAIN,
      data: JSON.stringify([blockchain.getLastedBlock()])
    };
  }

  initErrorHandler(ws) {
    const closeConnection = myWs => {
      this.sockets.splice(this.sockets.indexOf(myWs), 1);
    };
    ws.on("close", () => closeConnection(ws));
    ws.on("error", () => closeConnection(ws));
  }

  handleBlockchainResponse(receivedBlocks) {
    if (receivedBlocks.length === 0) {
      return;
    }
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlockHeld = blockchain.getLastedBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
      if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
        if (blockchain.addBlockToChain(latestBlockReceived)) {
          this.broadcast(this.responseLatestMsg());
        }
      } else if (receivedBlocks.length === 1) {
        this.broadcast(this.queryAllMsg());
      } else {
        blockchain.replaceChain(receivedBlocks);
      }
    }
  }

  broadcastLatest() {
    this.broadcast(this.responseLatestMsg());
  }

  connectToPeers(newPeer) {
    const ws = new WebSocket(newPeer);
    ws.on("open", () => {
      this.initConnection(ws);
    });
    ws.on("error", () => {
      console.log("connection failed");
    });
  }
}

module.exports = Websocket;
