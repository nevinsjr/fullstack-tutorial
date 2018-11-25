import { ApolloServer, ServerInfo } from 'apollo-server';
import { typeDefs } from './schema/schema';
import { LaunchAPI } from './datasources/launch';
import { UserAPI } from './datasources/user';
import { createStore } from './utils';
import { resolvers } from './resolvers';

async function runServer(server : ApolloServer) : Promise<void> {
    const serverInfo : ServerInfo = await server.listen();
    console.log(`🚀 Server ready at ${serverInfo.url}`);
}

//TODO: type meh
const store = createStore();

runServer(new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        launchAPI: new LaunchAPI(),
        userAPI: new UserAPI({store})
    })
    
}));
