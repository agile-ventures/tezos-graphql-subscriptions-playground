import { keys } from './keys';
import { cacheKeys } from './../cache-keys';
import { authenticateQuery } from './authenticator';
import { BlockResponse } from '@taquito/rpc';
import { convertResponseOrNull, handleNotFound } from './utils';

export const Query = {
    head(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return new Array<BlockResponse>(global.Cache.get<any>(cacheKeys.head));
    },

    async block(parent: any, args: { block: string | number | null }, context: any): Promise<BlockResponse | null> {
        authenticateQuery(context.request);
        // var block = await global.Client.getBlock({ block: args.block?.toString() || 'head' });
        // console.log(block);
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
    let ops = global.Cache.get<any>(cacheKeys.operations);
    return ops;
}