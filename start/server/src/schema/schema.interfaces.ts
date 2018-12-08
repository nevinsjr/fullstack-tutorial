//TODO:
// import { PatchSize } from './schema.constants';

export interface IUser {
    id: string;
    email: string;
    trips: Array<ILaunch>;
}

/**
 * Intended to describe the launch type from the schema.
 * Still felshing out the usage.
 */
export interface ILaunch {
    // could be a GraphQLScalarType
    id : string;
    site : string;
    mission : IMission;
    rocket : IRocket;
    isBooked : boolean;
}

export interface IMission {
    name : string;
    missionPatchSmall : string;
    missionPatchLarge : string;
}

export interface IRocket {
    id : string;
    name : String;
    type : String;
}

export interface ITripUpdateResponse {
    success : boolean;
    message : string;
    launches : Array<ILaunch>;
}
