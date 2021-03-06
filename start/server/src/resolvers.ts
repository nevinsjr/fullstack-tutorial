import { IDataSources, ILaunchResponse } from "./datasources/datasources.interfaces";
import { IResolvers, IResolverObject } from "graphql-tools";
import { paginateResults } from './utils';
import { ITripUpdateResponse } from "./schema/schema.interfaces";


// TODO: so much typing to fix here...


export const resolvers : IResolvers = {
    //TODO: this is a hot mess
    Query: <IResolverObject>{
        //TODO: this is gross
        launches: async (_, { pageSize = 20, after } : {pageSize : number, after : any}, { dataSources } : { dataSources : IDataSources}) : Promise<{launches : Array<Object>; cursor : any; hasMore : boolean;}>  => {
            const allLaunches : Array<ILaunchResponse> = await dataSources.launchAPI.getAllLaunches();
            allLaunches.reverse();

            const launches : Array<ILaunchResponse> = paginateResults({
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
        launchesByUser: async (_, __, { dataSources } : {dataSources : IDataSources}) : Promise<{launches : Array<Object>}> => {
            const userLaunchIds : Array<number> = await dataSources.userAPI.getLaunchIdsByUser();
            const userLaunches : Array<ILaunchResponse> = await dataSources.launchAPI.getLaunchesByIds(userLaunchIds);
            
            return {
                launches: userLaunches
            }
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
    Mutation: {
        //TODO: seriously...
        login: async (_, { email }, { dataSources }) : Promise<string | void > => {
            const user = await dataSources.userAPI.findOrCreateUser({ email });
            if (user) return new Buffer(email).toString('base64');
        },
        bookTrips: async (_, { launchIds }, { dataSources }) : Promise<ITripUpdateResponse> => {
            const results = await dataSources.userAPI.bookTrips({ launchIds });
            const launches = await dataSources.launchAPI.getLaunchesByIds({
              launchIds,
            });
        
            return {
                success: results && results.length === launchIds.length,
                message:
                    results.length === launchIds.length
                    ? 'trips booked successfully'
                    : `the following launches couldn't be booked: ${launchIds.filter(
                        id => !results.includes(id),
                        )}`,
                launches,
            };
          },
          cancelTrip: async (_, { launchId }, { dataSources }) : Promise<ITripUpdateResponse> => {
            const result = dataSources.userAPI.cancelTrip({ launchId });
        
            if (!result)
              return {
                success: false,
                message: 'failed to cancel trip',
                launches: []
              };
        
            const launch = await dataSources.launchAPI.getLaunchById({ launchId });
            return {
              success: true,
              message: 'trip cancelled',
              launches: [launch],
            };
          },
    },
    
};
