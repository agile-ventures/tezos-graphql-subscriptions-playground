import { RpcClient } from '@taquito/rpc';
import dotenv from 'dotenv';
import { GraphQLServer, PubSub } from 'graphql-yoga';
import NodeCache from 'node-cache';

import { Query } from './resolvers/query';
import { OperationContents, OperationResult, Subscription } from './resolvers/subscription';
import { TezosMonitor } from './tezos-monitor';
import { TezosWorker } from './tezos-worker';

const resolvers = {
    Query,
    Subscription,
    OperationContents,
    OperationResult
};

dotenv.config();

const provider = process.env.TEZOS_NODE;
const client = new RpcClient(provider);
const pubSub = new PubSub();
const cache = new NodeCache({ useClones: false });

declare global {
    var Cache: NodeCache
    var Client: RpcClient
};
global.Cache = cache;
global.Client = client;

const monitor = new TezosMonitor(provider);
const worker = new TezosWorker(client, pubSub, cache);

worker.startListening(monitor);
monitor.start();

const server = new GraphQLServer({
    typeDefs: './src/schema/schema.graphql',
    resolvers,
    context: cp => {
        return {
            ...cp,
            pubSub
        }
    },
});
server.start({ port: process.env.PORT }, 
    () => console.log(`Server is running on http://${process.env.HOST}:${process.env.PORT}, 
    app version: ${process.env.NPM_PACKAGE_VERSION}`));