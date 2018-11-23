import { LaunchAPI } from "./launch";
import { UserAPI } from "./user";

export interface IDataSources {
    launchAPI : LaunchAPI;
    userAPI : UserAPI;
}