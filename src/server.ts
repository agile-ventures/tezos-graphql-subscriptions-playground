import { GraphQLServer } from 'graphql-yoga'
import { PubSub } from 'graphql-yoga'
import { Operation, Block } from './types/types'
import { TezosWorker } from './tezos-worker'
import { Query } from './resolvers/query'
import { Subscription } from './resolvers/subscription'

const pubSub = new PubSub();

declare global {
    var Operations: Operation[]
    var Head: Block
};

const resolvers = {
    Query,
    Subscription
};

TezosWorker.start(pubSub);

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