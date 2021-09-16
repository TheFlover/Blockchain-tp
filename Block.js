const sha256 = require('crypto-js/sha256')

class Block {
    constructor(timestamp, data, precedinghash = ""){
        this.index = 0
        this.timestamp = timestamp
        this.data = data
        this.precedingHash = precedinghash
        this.hash = this.computeHash()
        this.nonce = 0
    }

    computeHash(){
        return sha256(this.index + this.timestamp + JSON.stringify(this.data) + this.precedingHash + this.nonce).toString()
    }

    proofOfWork = (difficulty) => new Promise((resolve) => {
        setImmediate(async () => {
            this.hash = this.computeHash();
            const dontMine = process.env.BREAK
            if (this.hash.substring(0, difficulty) == Array(difficulty + 1).join("0") || dontMine === 'true') {
                resolve({dontMine})
            } else{
                this.nonce++;
                resolve(await this.proofOfWork(difficulty))
            }
        })
    })
}

module.exports = Block