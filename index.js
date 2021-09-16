const express = require('express')
const Blockchain = require('./Blockchain')
const socketListener = require('./SocketListener')

const PORT = process.env.PORT || 3002

const app = express()
app.use(express.json())

const server = require('http').Server(app)
const io = require('socket.io')(server)
const client = require("socket.io-client")
const fetch = require("node-fetch");

const blockchain = new Blockchain()

app.get('/blocks', (req,res) => {
    res.json(blockchain.blockchain)
})

app.post('/mine', (req,res) => {
    const {timestamp, data} = req.body
    io.emit('mine', timestamp, data)
    res.redirect('/blocks')
})

app.post('/nodes', (req,res) => {
    const {host, port} = req.body
    const {callback} = req.query
    const node = `http://${host}:${port}`
    const socketNode = socketListener(client(node), blockchain)
    blockchain.addNewNode(socketNode)
    
    if(callback ==='true'){
        console.info(`Node ${node} added via callback`)
        res.json({status: 'Added node', node: node, callback: true})
    }else{
        fetch(`${node}/nodes?callback=true`, {
            method: 'POST',
            headers: {
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({host: req.hostname, port: PORT})
        })
        console.info(`Node ${node} added via callback`)
        res.json({status: 'Added node', node: node, callback: false})
    }
})

app.get('/nodes', (req,res) => {
    res.json({count: blockchain.nodes.length})
    //console.log(blockchain.nodes)
})

server.listen(PORT, () => {
    console.log('listening on port', PORT)
})

io.on('connection', (socket) => {
    console.info(`Socket connected ${socket.id}`)
    socket.on('disconnect', () => {
        console.info(`Socket disconnected ${socket.id}`)
    })
})

blockchain.addNewNode(socketListener(client(`http://localhost:${PORT}`), blockchain))
