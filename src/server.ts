import { GraphQLServer } from 'graphql-yoga'
import { RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga'
import { TezosWorker } from './tezos-worker'
import { TezosMonitor } from './tezos/tezos-monitor'
import { TezosPubSub } from './tezos/tezos-pub-sub'
import { Query } from './resolvers/query'
import { Subscription, OperationContents, OperationResult } from './resolvers/subscription'
import NodeCache from "node-cache";
import dotenv from 'dotenv';
import { ClientHttp2Session } from 'http2';
import { env } from 'process';

const resolvers = {
    Query,
    Subscription,
    OperationContents,
    OperationResult
};

dotenv.config();

const tezosNodeUrl = process.env.TEZOS_NODE;
const client = new RpcClient(tezosNodeUrl);
const pubSub = new PubSub();
const tezosPubSub = new TezosPubSub(pubSub);
const cache = new NodeCache({ useClones: false });

declare global {
    var Cache: NodeCache
    var Client: RpcClient
};
global.Cache = cache;
global.Client = client;

const monitor = new TezosMonitor(tezosNodeUrl, tezosPubSub);
const worker = new TezosWorker(client, pubSub, cache);

worker.startListening(tezosPubSub);
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
server.start({ port: process.env.PORT }, () => console.log(`Server is running on http://${process.env.HOST}:${process.env.PORT}, app version: ${process.env.NPM_PACKAGE_VERSION}`), );