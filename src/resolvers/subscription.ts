import { withFilter } from "graphql-yoga";
import { argsToArgsConfig } from "graphql/type/definition";
import { 
    IMonitorBlockHeaderNotification,
    IOperationNotification,
    IActivationNotification,
    IBallotNotification,
    IDelegationNotification,
    IDoubleBakingEvidenceNotification,
    IDoubleEndorsementEvidenceNotification,
    IEndorsementNotification,
    IOriginationNotification,
    IProposalsNotification,
    IRevealNotification,
    ISeedNonceRevelationNotification,
    ITransactionNotification

} from "../types/types";
import { authenticateSubscription } from "./authenticator";
import { keys } from './keys';

export const Subscription = {
    monitorBlockHeaderAdded: {
        subscribe: (parent: any, args: any, context: any, info: any) => subscribe(keys.newMonitorBlockHeader, parent, args, context, info),
        resolve: (payload: IMonitorBlockHeaderNotification) => payload,
    },
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
        resolve: (payload: IBallotNotification) => payload,
    },
    delegationAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newDelegation, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: IDelegationNotification) => payload,
    },
    doubleBakingEvidenceAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newDoubleBakingEvidence, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: IDoubleBakingEvidenceNotification) => payload,
    },
    doubleEndorsementEvidenceAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newDoubleEndorsementEvidence, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: IDoubleEndorsementEvidenceNotification) => payload,
    },
    endorsementAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newEndorsement, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: IEndorsementNotification) => payload,
    },
    originationAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newOrigination, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: IOriginationNotification) => payload,
    },
    proposalsAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newProposals, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: IProposalsNotification) => payload,
    },
    revealAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newReveal, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: IRevealNotification) => payload,
    },
    seedNonceRevelationAdded: {
        subscribe: withFilter(
            (parent: any, args: any, context: any, info: any) => subscribe(keys.newSeedNonceRevelation, parent, args, context, info),
            canReturn,
        ),
        resolve: (payload: ISeedNonceRevelationNotification) => payload,
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
    __resolveType(obj: any, context: any, info: any) {
        switch (obj.kind) {
            case keys.newActivateAccount: {
                return 'ActivateAccount';
            }
            case keys.newBallot: {
                return 'Ballot';
            }
            case keys.newDelegation: {
                return 'Delegation';
            }
            case keys.newDoubleBakingEvidence: {
                return 'DoubleBakingEvidence';
            }
            case keys.newDoubleEndorsementEvidence: {
                return 'DoubleEndorsementEvidence';
            }
            case keys.newEndorsement: {
                return 'Endorsement';
            }
            case keys.newOrigination: {
                return 'Origination';
            }
            case keys.newProposals: {
                return 'Proposals';
            }
            case keys.newReveal: {
                return 'Reveal';
            }
            case keys.newSeedNonceRevelation: {
                return 'SeedNonceRevelation';
            }
            case keys.newTransaction: {
                return 'Transaction';
            }
        }
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