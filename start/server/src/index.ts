import { ApolloServer, ServerInfo } from 'apollo-server';
import { typeDefs } from './schema/schema';
import { LaunchAPI } from './datasources/launch';
import { UserAPI } from './datasources/user';
import { createStore, IUserInstance } from './utils';
import { resolvers } from './resolvers';
import { Context } from 'apollo-server-core';
import { Request } from 'express';
import * as isEmail from 'isemail';

async function runServer(server : ApolloServer) : Promise<void> {
    const serverInfo : ServerInfo = await server.listen();
    console.log(`🚀 Server ready at ${serverInfo.url}`);
}

//TODO: type meh
const store = createStore();

// TODO: move me
export interface IUserContext<T> extends Context {
    user : T | null;
}

async function getContext({ req } : {req: Request}) : Promise<IUserContext<IUserInstance>> {
    // simple auth check on every request
    const auth : string = (req.headers && req.headers.authorization) || '';
    const email : string = new Buffer(auth, 'base64').toString('ascii');

    // if the email isn't formatted validly, return null for user
    if (!isEmail.validate(email)) return { user: null };
    
    // TODO: types will go a long way here
    // find a user by their email
    const users : [IUserInstance, boolean] = await store.users.findOrCreate({ where: { email } });
    // const user = users && users[0] ? users[0] : null;
    const user = users && users[0] ? users[0] : null;

    //TODO: this could be better
    return user ? { user: { ...user.get() as IUserInstance } } : { user: null };
  }

runServer(new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        launchAPI: new LaunchAPI(),
        userAPI: new UserAPI({store})
    }),
    context: getContext
}));
