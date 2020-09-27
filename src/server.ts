import { GraphQLServer } from 'graphql-yoga'
import { RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga'
import { TezosWorker } from './tezos-worker'
import { Query } from './resolvers/query'
import { Subscription, OperationContents, OperationResult } from './resolvers/subscription'
import NodeCache from "node-cache";

const resolvers = {
    Query,
    Subscription,
    OperationContents,
    OperationResult
};

const provider = 'https://testnet-tezos.giganode.io'; //'https://api.tezos.org.ua';
const client = new RpcClient(provider);
const pubSub = new PubSub();
const cache = new NodeCache({ useClones: false });

declare global {
    var Cache: NodeCache
};
global.Cache = cache;

const worker = new TezosWorker(client, pubSub, cache);
worker.start();

const server = new GraphQLServer({
    typeDefs: './src/schema/schema.graphql',
    resolvers,
    context: request => {
        return {
            ...request,
            pubSub
        }
    },
});
server.start(() => console.log(`Server is running on http://localhost:4000`));