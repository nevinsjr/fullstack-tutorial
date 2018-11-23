import { RESTDataSource } from 'apollo-datasource-rest';

export class LaunchAPI extends RESTDataSource {
    
    public baseURL : string = 'https://api.spacexdata.com/v2/';

    private readonly launches : string = 'launches';
    
    constructor() {
      super();
    }

    // TODO: fix return type
    public async getAllLaunches() : Promise<Array<{}>> {
        // TODO: create an interface for the response
        const response : any = await this.get(this.launches);
        return response && response.length ?
            response.map((launch : any) => this.launchReducer(launch)) :
            [];
    }

    // TODO: return type
    public async getLaunchById({ launchId } : { launchId : number }) : Promise<{}> {
        console.log(arguments);
        const res = await this.get(this.launches, { flight_number: launchId });
        return this.launchReducer(res[0]);
    }
      
    // TODO: return type
    public async getLaunchesByIds({ launchIds } : { launchIds : Array<number> }) : Promise<Array<{}>>  {
        return Promise.all(
            launchIds.map((launchId : any) => this.getLaunchById({ launchId })),
        );
    }

    // TODO: fix the any type
    private launchReducer(launch : any) {
        return {
          id: launch.flight_number || 0,
          cursor: `${launch.launch_date_unix}`,
          site: launch.launch_site && launch.launch_site.site_name,
          mission: {
            name: launch.mission_name,
            missionPatchSmall: launch.links.mission_patch_small,
            missionPatchLarge: launch.links.mission_patch,
          },
          rocket: {
            id: launch.rocket.rocket_id,
            name: launch.rocket.rocket_name,
            type: launch.rocket.rocket_type,
          },
        };
      }
}
