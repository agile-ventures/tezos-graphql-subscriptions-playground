import { keys } from './keys';

export const Query = {
    operations(parent: any, args: any, context: any) {
        return global.Operations;
    },

    transactions(parent: any, args: any, context: any) {
        return global.Operations.filter(o => o.kind === keys.newTransaction);
    },

    endorsements(parent: any, args: any, context: any) {
        return global.Operations.filter(o => o.kind === keys.newEndorsement);
    },

    reveals(parent: any, args: any, context: any) {
        return global.Operations.filter(o => o.kind === keys.newReveal);
    },

    originations(parent: any, args: any, context: any) {
        return global.Operations.filter(o => o.kind === keys.newOrigination);
    },

    delegations(parent: any, args: any, context: any) {
        return global.Operations.filter(o => o.kind === keys.newDelegation);
    },
}