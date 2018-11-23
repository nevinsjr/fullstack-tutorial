import { IDataSources } from "./datasources/datasources.interfaces";
import { IResolvers, IResolverObject } from "graphql-tools";

export const resolvers : IResolvers = {
    Query: <IResolverObject>{
        launches: async (_, __, { dataSources } : { dataSources : IDataSources}) : Promise<Array<{}>>  => 
            dataSources.launchAPI.getAllLaunches(),
        launch: async (_, { id } : { id : number }, { dataSources } : { dataSources : IDataSources}) : Promise<{}> => 
            dataSources.launchAPI.getLaunchById({ launchId: id }),
        me: async (_, __, { dataSources }) : Promise<{}> => 
            dataSources.userAPI.findOrCreateUser()
    }
};
