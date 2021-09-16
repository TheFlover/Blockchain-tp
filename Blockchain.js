const Block = require('./Block')
const express = require('express')
const app = express()
app.use(express.json())
const server = require('http').Server(app)
const io = require('socket.io')(server)

class Blockchain {
  constructor() {
    this.blockchain = [this.startGenesisBlock()]
    this.difficulty = 2;
    this.nodes = []
    this.io = io
  }
  startGenesisBlock() {
    return new Block(0, Date.now(), { sender: '', receiver: '', qty: 0 }, "0")
  }
  getLatestBlock() {
    return this.blockchain[this.blockchain.length - 1]
  }

  async addNewBlock(newBlock) {
    newBlock.precedingHash = this.getLatestBlock().hash
    newBlock.index = this.getLatestBlock().index + 1
    process.env.BREAK = false;
    const { dontMine } = await newBlock.proofOfWork(this.difficulty)
    console.log(newBlock)
    if (dontMine !== 'true') {
      this.blockchain.push(newBlock);
      this.io.emit("miningdone", this.blockchain)
    }
  }


  checkChainValidity(chain) {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const precedingBlock = chain[i - 1];

      if (currentBlock.hash !== currentBlock.computeHash()) return false;
      if (currentBlock.precedingHash !== precedingBlock.hash) return false;
    }
    return true;
  }

  addNewNode(node) {
    this.nodes.push(node)
  }
}

module.exports = Blockchain
