const { GraphQLServer } = require('graphql-yoga')
const { PubSub } = require('graphql-yoga')
const { RpcClient } = require('@taquito/rpc');

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const Subscription = require('./resolvers/Subscription')

const pubsub = new PubSub()

// const provider = 'https://api.tezos.org.ua';
const provider = 'https://testnet-tezos.giganode.io';
let rpcClient = new RpcClient(provider);

global.operations = [];
global.idCount = 0

const resolvers = {
    Query,
    Mutation,
    Subscription
}

let interval = setInterval(() => {
    rpcClient.getBlock()
        .then(data => processBlock(data))
        .catch(err => console.error(err));
}, 5000)

function processBlock(block) {
    if (global.block && global.block.hash === block.hash) {
        console.log('block ' + block.hash + ' already notified')
        return
    } else {
        global.block = block;
    }

    let operationsCount = 0;
    if (block.operations[0]) {
        operationsCount += block.operations[0].length
        processOperations(block.operations[0])
    }

    if (block.operations[1]) {
        operationsCount += block.operations[1].length
        processOperations(block.operations[1])
    }

    if (block.operations[2]) {
        operationsCount += block.operations[2].length
        processOperations(block.operations[2])
    }

    if (block.operations[3]) {
        operationsCount += block.operations[3].length
        processOperations(block.operations[3])
    }

    if (block.operations[4]) {
        operationsCount += block.operations[4].length
        processOperations(block.operations[4])
    }

    console.log('block ' + block.hash + ' processed')
    console.log('operations count ' + operationsCount);
}

function processOperations(operations) {
    operations.forEach(operation => {
        operation.contents.forEach(content => {
            const newOperation = {
                kind: content.kind,
                hash: operation.hash
            }
            pubsub.publish("NEW_OPERATION", newOperation)

            if (newOperation.kind === 'transaction') {
                const newTransaction = {
                    kind: newOperation.kind,
                    hash: newOperation.hash,
                    fee: content.fee,
                    amount: content.amount,
                    source: content.source,
                    destination: content.destination
                }
                pubsub.publish("NEW_TRANSACTION", newTransaction)
                pubsub.publish("NEW_TRANSACTION_S=" + content.source, newTransaction)
            }

            if (newOperation.kind === 'endorsement') {
                pubsub.publish("NEW_ENDORSEMENT", newOperation)
            }

            if (newOperation.kind === 'reveal') {
                pubsub.publish("NEW_REVEAL", newOperation)
            }

            global.operations.push(newOperation);

            console.log(newOperation.kind + ' ' + newOperation.hash)
        })
    })
}

const server = new GraphQLServer({
    typeDefs: './schema.graphql',
    resolvers,
    context: request => {
        return {
            ...request,
            pubsub
        }
    },
})
server.start(() => console.log(`Server is running on http://localhost:4000`))