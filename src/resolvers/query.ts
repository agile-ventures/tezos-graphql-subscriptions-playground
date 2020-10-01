import { keys } from './keys';
import { cacheKeys } from './../cache-keys';
import { authenticateQuery } from './authenticator';
import { BlockResponse } from '@taquito/rpc';
import { Block } from '../types/types';
import { convertResponseOrNull, handleNotFound } from './utils';

export const Query = {
    head(parent: any, args: any, context: any) {
        authenticateQuery(context.request);
        return new Array<BlockResponse>(global.Cache.get<any>(cacheKeys.head));
    },

    async block(parent: any, args: { block: string | number | null }, context: any): Promise<Block | null> {
        authenticateQuery(context.request);
        
        let block = global.Client.getBlock({ block: args.block?.toString() || 'head' });
        console.log(JSON.stringify(block));

        return convertResponseOrNull(await handleNotFound(() => global.Client.getBlock({ block: args.block?.toString() || 'head' })));
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