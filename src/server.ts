import { GraphQLServer } from 'graphql-yoga'
import { RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga'
import { TezosWorker } from './tezos-worker'
import { TezosMonitor } from './tezos-monitor'
import { Query } from './resolvers/query'
import { Subscription, OperationContents, OperationResult } from './resolvers/subscription'
import NodeCache from "node-cache";
import dotenv from 'dotenv';

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
};
global.Cache = cache;

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
server.start({ port: process.env.PORT }, () => console.log(`Server is running on http://${process.env.HOST}:${process.env.PORT}`), );