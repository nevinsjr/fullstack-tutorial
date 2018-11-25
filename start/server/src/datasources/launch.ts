import { RESTDataSource } from 'apollo-datasource-rest';
import { ILaunchResponse, ISpacexLaunch } from './datasources.interfaces';

export class LaunchAPI extends RESTDataSource {
    
    public baseURL : string = 'https://api.spacexdata.com/v2/';

    private readonly LAUNCHES : string = 'launches';
    
    constructor() {
      super();
    }

    public async getAllLaunches() : Promise<Array<ILaunchResponse>> {
        const response : Array<ISpacexLaunch> = await this.get<Array<ISpacexLaunch>>(this.LAUNCHES);
        return response && response.length ?
            response.map((launch : ISpacexLaunch) => this.launchReducer(launch)) :
            [];
    }

    public async getLaunchById({ launchId } : { launchId : number }) : Promise<ILaunchResponse> {
        const res = await this.get<Array<ISpacexLaunch>>(this.LAUNCHES, { flight_number: launchId });
        return this.launchReducer(res[0]);
    }
      
    public async getLaunchesByIds({ launchIds } : { launchIds : Array<number> }) : Promise<Array<ILaunchResponse>>  {
        return Promise.all(
            launchIds.map((launchId : number) => this.getLaunchById({ launchId })),
        );
    }

    private launchReducer(launch : ISpacexLaunch) : ILaunchResponse {
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
