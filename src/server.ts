import { GraphQLServer } from 'graphql-yoga'
import { RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga'
import { OperationEntry, Block } from './types/types'
import { TezosWorker } from './tezos-worker'
import { Query } from './resolvers/query'
import { Subscription } from './resolvers/subscription'

const provider = 'https://testnet-tezos.giganode.io'; //'https://api.tezos.org.ua';
let client = new RpcClient(provider);

const pubSub = new PubSub();

declare global {
    var Operations: any[]
    var Head: Block
};

const resolvers = {
    Query,
    Subscription
};

const worker = new TezosWorker(client, pubSub);
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