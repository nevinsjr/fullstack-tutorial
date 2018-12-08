import { LaunchAPI } from "./launch";
import { UserAPI } from "./user";
import { IMission, IRocket } from "../schema/schema.interfaces";

/**
 * Interface describing the datasources we are plugging
 * into our API.
 */
export interface IDataSources {
    launchAPI : LaunchAPI;
    userAPI : UserAPI;
}

/**
 * Describes a response from the spacex API.
 */
export interface ISpacexLaunch {
    flight_number : number;
    launch_date_unix : string;
    launch_site : {
        site_name : string;
    };
    mission_name : string;
    links : {
        mission_patch_small : string;
        mission_patch : string;
    };
    rocket : {
        rocket_id : string;
        rocket_name : string;
        rocket_type : string;
    }
}

/**
 * Describes the response from this API.
 */
export interface ILaunchResponse {
    id : number;
    cursor : string;
    site: string;
    mission : IMission;
    rocket : IRocket;
}
