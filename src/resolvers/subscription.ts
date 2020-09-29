import { withFilter } from "graphql-yoga";
import { argsToArgsConfig } from "graphql/type/definition";
import { IOperationNotification, IActivationNotification, ITransactionNotification } from "../types/types";
import { authenticateSubscription } from "./authenticator";
import { keys } from './keys';

export const Subscription = {
    operationAdded: {
        subscribe: (parent: any, args: any, context: any, info: any) => subscribe(keys.newOperation, parent, args, context, info),
        resolve: (payload: IOperationNotification) => payload,
    },
    activationAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newActivateAccount, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: IActivationNotification) => payload,
    },
    ballotAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newBallot, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: any) => payload,
    },
    delegationAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newDelegation, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: any) => payload,
    },
    doubleBakingEvidenceAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newDoubleBakingEvidence, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: any) => payload,
    },
    doubleEndorsementEvidenceAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newDoubleEndorsementEvidence, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: any) => payload,
    },
    endorsementAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newEndorsement, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: any) => payload,
    },
    originationAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newOrigination, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: any) => payload,
    },
    proposalsAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newProposals, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: any) => payload,
    },
    revealAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newReveal, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: any) => payload,
    },
    seedNonceRevelationAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newSeedNonceRevelation, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: any) => payload,
    },
    transactionAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newTransaction, parent, args, context, info),
            canReturn
        ),
        resolve: (payload: ITransactionNotification) => payload,
    }
}

export const OperationContents = {
    __resolveType() {
        return null;
    }
}

export const OperationResult = {
    __resolveType() {
        return null;
    }
}

export function canReturn(payload: any, variables: any): boolean {
    let ret = true;
    getMembers(variables).forEach((p: string) => {
        if (payload[p]) {
            ret = ret && variables[p] === payload[p];
        }
    });
    return ret
}

export function getMembers(instance: any): string[] {
    return Object.getOwnPropertyNames(instance);
}

function subscribe(key: string, parent: any, args: any, context: any, info: any) {
    authenticateSubscription(context.connection.context);
    return context.pubSub.asyncIterator(key);
}