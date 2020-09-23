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
        context.pubsub.publish("NEW_TRANSACTION", newTransaction)
    }

    if (newOperation.kind === 'endorsement') {
        context.pubsub.publish("NEW_ENDORSEMENT", newOperation)
    }

    if (newOperation.kind === 'reveal') {
        context.pubsub.publish("NEW_REVEAL", newOperation)
    }

    context.pubsub.publish("NEW_OPERATION", newOperation)

    return newOperation
}

module.exports = {
    post,
}