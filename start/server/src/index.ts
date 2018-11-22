import { ApolloServer, ServerInfo } from 'apollo-server';
import { typeDefs } from './schema';

async function runServer(server : ApolloServer) : Promise<void> {
    const serverInfo : ServerInfo = await server.listen();
    console.log(`🚀 Server ready at ${serverInfo.url}`);
}

runServer(new ApolloServer({typeDefs}));
