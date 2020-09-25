import { withFilter } from "graphql-yoga";
import { argsToArgsConfig } from "graphql/type/definition";
import { keys } from './keys';

export const Subscription = {
        operation: {
            subscribe: operationSubscribe,
            resolve: (payload: any) => {
                return payload
            },
        },
        transaction: {
            subscribe: withFilter(
                transactionSubscribe,
                (payload: any, variables: any) => {
                    let ret = true;
                    if (!variables.source && !variables.destination) {
                        return ret;
                    }

                    if (variables.source) {
                        ret = ret && payload.source === variables.source;
                    }

                    if (variables.destination) {
                        ret = ret && payload.destination === variables.destination;
                    }

                    return ret;
                },
            ),
            resolve: (payload: any) => {
                return payload
            },
        },
        endorsement: {
            subscribe: withFilter(
                endorsementSubscribe,
                (payload: any, variables: any) => {
                    let ret = true;
                    if (!variables.hash && !variables.delegate) {
                        return ret;
                    }

                    if (variables.hash) {
                        ret = ret && payload.hash === variables.hash;
                    }

                    if (variables.delegate) {
                        ret = ret && payload.delegate === variables.delegate;
                    }

                    return ret;
                },
            ),
            resolve: (payload: any) => {
                return payload;
            },
        },
        reveal: {
            subscribe: withFilter(
                revealSubscribe,
                (payload: any, variables: any) => {
                    let ret = true;
                    if (!variables.hash && !variables.source && !variables.status) {
                        return ret;
                    }

                    if (variables.hash) {
                        ret = ret && payload.hash === variables.hash;
                    }

                    if (variables.source) {
                        ret = ret && payload.source === variables.source;
                    }

                    if (variables.status) {
                        ret = ret && payload.status === variables.status;
                    }

                    return ret;
                },
            ),
            resolve: (payload: any) => {
                return payload;
            },
        }
}

function operationSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newOperation);
}

function transactionSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newTransaction);
}

function endorsementSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newEndrosement);
}

function revealSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newReveal);
}