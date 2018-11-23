import { IDataSources } from "./datasources/datasources.interfaces";
import { IResolvers, IResolverObject } from "graphql-tools";
import { paginateResults } from './utils';


// TODO: so much typing to fix here...


export const resolvers : IResolvers = {
    Query: <IResolverObject>{
        //TODO: this is gross
        launches: async (_, { pageSize = 20, after } : {pageSize : number, after : any}, { dataSources } : { dataSources : IDataSources}) : Promise<{launches : Array<Object>; cursor : any; hasMore : boolean;}>  => {
            const allLaunches : Array<{}> = await dataSources.launchAPI.getAllLaunches();
            allLaunches.reverse();

            const launches : Array<Object> = paginateResults({
                after,
                pageSize,
                results: allLaunches,
              });

              return {
                launches,
                cursor: launches.length ? (<any>launches)[launches.length - 1].cursor : null,
                // if the cursor of the end of the paginated results is the same as the
                // last item in _all_ results, then there are no more results after this
                hasMore: launches.length
                  ? (<any>launches)[launches.length - 1].cursor !==
                    (<any>allLaunches)[allLaunches.length - 1].cursor
                  : false,
              };

        },
        launch: async (_, { id } : { id : number }, { dataSources } : { dataSources : IDataSources}) : Promise<{}> => 
            dataSources.launchAPI.getLaunchById({ launchId: id }),
        me: async (_, __, { dataSources }) : Promise<{}> => 
            dataSources.userAPI.findOrCreateUser()
    },
    Mission: {
        //TODO: strong typing
        // make sure the default size is 'large' in case user doesn't specify
        missionPatch: (mission, { size } = { size: 'LARGE' }) : string => {
            // TODO: magic string here
            return size === 'SMALL'
                ? mission.missionPatchSmall
                : mission.missionPatchLarge;
        },
    },
    Launch: {
        isBooked: async (launch, _, { dataSources }) =>
          dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
    },
    User: {
        trips: async (_, __, { dataSources }) => {
            // get ids of launches by user
            const launchIds = await dataSources.userAPI.getLaunchIdsByUser();

            if (!launchIds.length) return [];
    
            // look up those launches by their ids
            return (
                dataSources.launchAPI.getLaunchesByIds({
                    launchIds,
                }) || []
            );
        },
    },
};
