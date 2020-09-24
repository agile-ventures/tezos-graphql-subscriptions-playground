const { GraphQLServer } = require('graphql-yoga')
const { PubSub } = require('graphql-yoga')

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const Subscription = require('./resolvers/Subscription')

const pubSub = new PubSub()

const resolvers = {
    Query,
    Mutation,
    Subscription
}

const worker = require('./TezosWorker');
worker.start(pubSub);

const server = new GraphQLServer({
    typeDefs: './schema.graphql',
    resolvers,
    context: request => {
        return {
            ...request,
            pubSub
        }
    },
})
server.start(() => console.log(`Server is running on http://localhost:4000`))