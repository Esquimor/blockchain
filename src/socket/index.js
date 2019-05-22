const WebSocket = require("./WebSocket");

const p2pPort = parseInt(process.env.P2P_PORT) || 8301;
module.exports = new WebSocket(p2pPort);
