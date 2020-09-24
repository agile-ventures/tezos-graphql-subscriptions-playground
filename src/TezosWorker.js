const { RpcClient } = require('@taquito/rpc');

const { pubSubKeys } = require('./resolvers/PubSubKeys');

module.exports = {
    start: function(pubSub) {
        global.operations = [];
        global.idCount = 0

        const provider = 'https://testnet-tezos.giganode.io'; //'https://api.tezos.org.ua'
        let rpcClient = new RpcClient(provider);

        let interval = setInterval(() => {
            rpcClient.getBlock()
                .then(data => processBlock(data, pubSub))
                .catch(err => console.error(err));
        }, 5000)
    }
}

function processBlock(block, pubSub) {
    if (global.block && global.block.hash === block.hash) {
        console.log('block ' + block.hash + ' already notified')
        return
    } else {
        global.block = block;
    }

    let operationsCount = 0;

    block.operations.forEach(o => {
        if (!o) {
            return;
        }

        operationsCount += o.length
        processOperations(o, pubSub)
    })

    console.log('block ' + block.hash + ' processed')
    console.log('operations count ' + operationsCount);
}

function processOperations(operations, pubSub) {
    operations.forEach(operation => {
        operation.contents.forEach(content => {
            const newOperation = {
                kind: content.kind,
                hash: operation.hash
            }
            pubSub.publish(pubSubKeys.newOperation, newOperation)

            if (newOperation.kind === 'transaction') {
                const newTransaction = {
                    kind: newOperation.kind,
                    hash: newOperation.hash,
                    fee: content.fee,
                    amount: content.amount,
                    source: content.source,
                    destination: content.destination,
                }
                pubSub.publish(pubSubKeys.newTransaction, newTransaction)
            }

            if (newOperation.kind === 'endorsement') {
                const newEndorsement = {
                    kind: newOperation.kind,
                    hash: newOperation.hash,
                    delegate: content.delegate,
                }
                pubSub.publish(pubSubKeys.newEndrosement, newEndorsement)
            }

            if (newOperation.kind === 'reveal') {
                const newReveal = {
                    kind: newOperation.kind,
                    hash: newOperation.hash,
                    source: content.source,
                    status: content.status,
                }
                pubSub.publish(pubSubKeys.newReveal, newReveal)
            }

            global.operations.push(newOperation);
        })
    })
}