const { argsToArgsConfig } = require("graphql/type/definition")

function operationSubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_OPERATION")
}

function transactionSubscribe(parent, args, context, info) {
    let key = "NEW_TRANSACTION";
    if (args.source) {
        key = key + "_S=" + args.source
    }

    return context.pubsub.asyncIterator(key)
}

function endorsementSubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_ENDORSEMENT")
}

function revealSubscribe(parent, args, context, info) {
    return context.pubsub.asyncIterator("NEW_REVEAL")
}

const operation = {
    subscribe: operationSubscribe,
    resolve: payload => {
        return payload
    },
}

const transaction = {
    subscribe: transactionSubscribe,
    resolve: payload => {
        return payload
    },
}

const endorsement = {
    subscribe: endorsementSubscribe,
    resolve: payload => {
        return payload
    },
}

const reveal = {
    subscribe: revealSubscribe,
    resolve: payload => {
        return payload
    },
}


module.exports = {
    operation,
    transaction,
    endorsement,
    reveal
}