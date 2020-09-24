const { withFilter } = require("graphql-yoga")
const { argsToArgsConfig } = require("graphql/type/definition")
const { pubSubKeys } = require('./PubSubKeys');

function operationSubscribe(parent, args, context, info) {
    return context.pubSub.asyncIterator(pubSubKeys.newOperation)
}

function transactionSubscribe(parent, args, context, info) {
    return context.pubSub.asyncIterator(pubSubKeys.newTransaction)
}

function endorsementSubscribe(parent, args, context, info) {
    return context.pubSub.asyncIterator(pubSubKeys.newEndrosement)
}

function revealSubscribe(parent, args, context, info) {
    return context.pubSub.asyncIterator(pubSubKeys.newReveal)
}

const operation = {
    subscribe: operationSubscribe,
    resolve: payload => {
        return payload
    },
}

const transaction = {
    subscribe: withFilter(
        transactionSubscribe,
        (payload, variables) => {
            let ret = true;
            if (!variables.source && !variables.destination) {
                return ret
            }

            if (variables.source) {
                ret = ret && payload.source === variables.source
            }

            if (variables.destination) {
                ret = ret && payload.destination === variables.destination
            }

            return ret;
        },
    ),
    resolve: payload => {
        return payload
    },
}

const endorsement = {
    subscribe: withFilter(
        endorsementSubscribe,
        (payload, variables) => {
            let ret = true;
            if (!variables.hash && !variables.delegate) {
                return ret
            }

            if (variables.hash) {
                ret = ret && payload.hash === variables.hash
            }

            if (variables.delegate) {
                ret = ret && payload.delegate === variables.delegate
            }

            return ret;
        },
    ),
    resolve: payload => {
        return payload
    },
}

const reveal = {
    subscribe: withFilter(
        revealSubscribe,
        (payload, variables) => {
            let ret = true;
            if (!variables.hash && !variables.source && !variables.status) {
                return ret
            }

            if (variables.hash) {
                ret = ret && payload.hash === variables.hash
            }

            if (variables.source) {
                ret = ret && payload.source === variables.source
            }

            if (variables.status) {
                ret = ret && payload.status === variables.status
            }

            return ret;
        },
    ),
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