import { withFilter } from "graphql-yoga";
import { argsToArgsConfig } from "graphql/type/definition";
import { keys } from './keys';

export const Subscription = {
    operationAdded: {
        subscribe: operationSubscribe,
        resolve: (payload: any) => {
            return payload
        },
    },
    activationAdded: {
        subscribe: withFilter(
            activationSubscribe,
            (payload: any, variables: any) => {
                let ret = true;
                if (!variables.address) {
                    return ret;
                }

                if (variables.address) {
                    ret = ret && payload.address === variables.address;
                }

                return ret;
            },
        ),
        resolve: (payload: any) => {
            return payload
        },
    },
    ballotAdded: {
        subscribe: withFilter(
            ballotSubscribe,
            (payload: any, variables: any) => {
                let ret = true;
                if (!variables.source && !variables.proposal && !variables.ballot) {
                    return ret;
                }

                if (variables.source) {
                    ret = ret && payload.source === variables.source;
                }

                if (variables.proposal) {
                    ret = ret && payload.proposal === variables.proposal;
                }

                if (variables.ballot) {
                    ret = ret && payload.ballot === variables.ballot;
                }

                return ret;
            },
        ),
        resolve: (payload: any) => {
            return payload
        },
    },
    delegationAdded: {
        subscribe: withFilter(
            delegationSubscribe,
            (payload: any, variables: any) => {
                let ret = true;
                if (!variables.source && !variables.delegate && !variables.status) {
                    return ret;
                }

                if (variables.source) {
                    ret = ret && payload.source === variables.source;
                }

                if (variables.delegate) {
                    ret = ret && payload.delegate === variables.delegate;
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
    },
    doubleBakingEvidenceAdded: {
        subscribe: withFilter(
            doubleBakingEvidenceSubscribe,
            (payload: any, variables: any) => {
                let ret = true;
                if (!variables.delegate) {
                    return ret;
                }

                if (variables.delegate) {
                    ret = ret && payload.delegate === variables.delegate;
                }

                return ret;
            },
        ),
        resolve: (payload: any) => {
            return payload
        },
    },
    doubleEndorsementEvidenceAdded: {
        subscribe: withFilter(
            doubleEndorsementEvidenceSubscribe,
            (payload: any, variables: any) => {
                let ret = true;
                if (!variables.delegate) {
                    return ret;
                }

                if (variables.delegate) {
                    ret = ret && payload.delegate === variables.delegate;
                }

                return ret;
            },
        ),
        resolve: (payload: any) => {
            return payload
        },
    },
    endorsementAdded: {
        subscribe: withFilter(
            endorsementSubscribe,
            (payload: any, variables: any) => {
                let ret = true;
                if (!variables.delegate) {
                    return ret;
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
    originationAdded: {
        subscribe: withFilter(
            originationSubscribe,
            (payload: any, variables: any) => {
                let ret = true;
                if (!variables.source && !variables.delegate && !variables.originatedContract && !variables.status) {
                    return ret;
                }

                if (variables.source) {
                    ret = ret && payload.source === variables.source;
                }

                if (variables.delegate) {
                    ret = ret && payload.delegate === variables.delegate;
                }
                
                if (variables.originatedContract) {
                    ret = ret && payload.originatedContract === variables.originatedContract;
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
    },
    proposalsAdded: {
        subscribe: withFilter(
            proposalsSubscribe,
            (payload: any, variables: any) => {
                let ret = true;
                if (!variables.source && !variables.proposal) {
                    return ret;
                }

                if (variables.source) {
                    ret = ret && payload.source === variables.source;
                }

                if (variables.proposal) {
                    ret = ret && payload.proposal === variables.proposal;
                }
                
                return ret;
            },
        ),
        resolve: (payload: any) => {
            return payload;
        },
    },
    revealAdded: {
        subscribe: withFilter(
            revealSubscribe,
            (payload: any, variables: any) => {
                let ret = true;
                if (!variables.source && !variables.status) {
                    return ret;
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
    },
    seedNonceRevelationAdded: {
        subscribe: withFilter(
            seedNonceRevelationSubscribe,
            (payload: any, variables: any) => {
                let ret = true;
                if (!variables.delegate) {
                    return ret;
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
    transactionAdded: {
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
}

function operationSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newOperation);
}

function activationSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newActivateAccount);
}

function ballotSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newBallot);
}

function delegationSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newDelegation);
}

function doubleBakingEvidenceSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newDoubleBakingEvidence);
}

function doubleEndorsementEvidenceSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newDoubleEndorsementEvidence);
}

function endorsementSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newEndorsement);
}

function originationSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newOrigination);
}

function proposalsSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newProposals);
}

function revealSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newReveal);
}

function seedNonceRevelationSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newSeedNonceRevelation);
}

function transactionSubscribe(parent: any, args: any, context: any, info: any) {
    return context.pubSub.asyncIterator(keys.newTransaction);
}