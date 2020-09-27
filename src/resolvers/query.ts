import { keys } from './keys';
import { cacheKeys } from './../cache-keys';

export const Query = {
    head(parent: any, args: any, context: any) {
        return new Array<any>(global.Cache.get<any>(cacheKeys.head));
    },

    operations(parent: any, args: any, context: any) {
        return getOperations();
    },

    transactions(parent: any, args: any, context: any) {
        return getOperations().filter((o: { kind: string; }) => o.kind === keys.newTransaction);
    },

    endorsements(parent: any, args: any, context: any) {
        return getOperations().filter((o: { kind: string; }) => o.kind === keys.newEndorsement);
    },

    reveals(parent: any, args: any, context: any) {
        return getOperations().filter((o: { kind: string; }) => o.kind === keys.newReveal);
    },

    originations(parent: any, args: any, context: any) {
        return getOperations().filter((o: { kind: string; }) => o.kind === keys.newOrigination);
    },

    delegations(parent: any, args: any, context: any) {
        return getOperations().filter((o: { kind: string; }) => o.kind === keys.newDelegation);
    },
}

function getOperations(): any {
    return global.Cache.get<any>(cacheKeys.operations);
}