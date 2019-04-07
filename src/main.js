const Block = require("./blockchain/Block");
const Chain = require("./blockchain/Chain");

let chain = new Chain();

const block1 = new Block([], "123");
const block2 = new Block([], "123");

chain.addBlock(block1);

chain.addBlock(block2);
console.log(JSON.stringify(chain.chain, null, 4));
