const Block = require('./Block')

const socketListener = (socket, chain) => {
    socket.on('mine', (timestamp, data) => {
        let block = new Block(timestamp, data)
        chain.addNewBlock(block)
        console.info(`Block number ${block.index} just mined`)
    })
    socket.on('miningdone', (blockchain) => {
        process.env.BREAK = false
        chain = blockchain
    })
    return socket
}

module.exports = socketListener