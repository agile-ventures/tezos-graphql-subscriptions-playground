import { BlockResponse } from '@taquito/rpc';

import { cacheKeys } from './../cache-keys';
import { authenticateQuery } from './authenticator';
import { keys } from './keys';
import { convertResponseOrNull, handleNotFound } from './utils';

export const Query = {
    head(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return new Array<BlockResponse>(global.Cache.get<any>(cacheKeys.head));
    },

    async block(parent: any, args: { block: string | number | null }, context: any): Promise<BlockResponse | null> {
        authenticateQuery(context.request);
        return convertResponseOrNull(await handleNotFound(() => global.Client.getBlock({ block: args.block?.toString() || 'head' })));
    },

    operations(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations();
    },

    transactions(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations().filter((o: { key: string; }) => o.key === keys.newTransaction);
    },

    endorsements(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations().filter((o: { key: string; }) => o.key === keys.newEndorsement);
    },

    reveals(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations().filter((o: { key: string; }) => o.key === keys.newReveal);
    },

    originations(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations().filter((o: { key: string; }) => o.key === keys.newOrigination);
    },

    delegations(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return getOperations().filter((o: { key: string; }) => o.key === keys.newDelegation);
    },
}

function getOperations(): any {
    return global.Cache.get<any>(cacheKeys.operations);
}