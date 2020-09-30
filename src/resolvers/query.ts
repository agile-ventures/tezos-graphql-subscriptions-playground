import { keys } from './keys';
import { cacheKeys } from './../cache-keys';
import { authenticateQuery } from './authenticator';

export const Query = {
    head(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return new Array<any>(global.Cache.get<any>(cacheKeys.head));
    },

    operations(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations();
    },

    transactions(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations().filter((o: { kind: string; }) => o.kind === keys.newTransaction);
    },

    endorsements(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations().filter((o: { kind: string; }) => o.kind === keys.newEndorsement);
    },

    reveals(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations().filter((o: { kind: string; }) => o.kind === keys.newReveal);
    },

    originations(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations().filter((o: { kind: string; }) => o.kind === keys.newOrigination);
    },

    delegations(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations().filter((o: { kind: string; }) => o.kind === keys.newDelegation);
    },
}

function getOperations(): any {
    let ops = global.Cache.get<any>(cacheKeys.operations);
    return ops;
}