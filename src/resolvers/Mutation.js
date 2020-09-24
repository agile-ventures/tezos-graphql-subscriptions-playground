const { pubSubKeys } = require('./PubSubKeys');

function post(parent, args, context) {
    const newOperation = {
        kind: args.kind,
        hash: `some-generated-hash-${global.idCount++}`
    }

    global.operations.push(newOperation)

    if (newOperation.kind === 'transaction') {
        const newTransaction = {
            kind: newOperation.kind,
            hash: newOperation.hash,
            fee: '1',
            amount: '10',
            source: 'source',
            destination: 'destination'
        }
        context.pubSub.publish(pubSubKeys.newTransaction, newTransaction)
    }

    if (newOperation.kind === 'endorsement') {
        const newEndrosement = {
            kind: newOperation.kind,
            hash: newOperation.hash,
            delegate: "delegate"
        }
        context.pubSub.publish(pubSubKeys.newEndrosement, newEndrosement)
    }

    if (newOperation.kind === 'reveal') {
        const newReveal = {
            kind: newOperation.kind,
            hash: newOperation.hash,
            source: "source",
            status: "status",
        }
        context.pubSub.publish(pubSubKeys.newReveal, newReveal)
    }

    context.pubSub.publish(pubSubKeys.newOperation, newOperation)

    return newOperation
}

module.exports = {
    post,
}