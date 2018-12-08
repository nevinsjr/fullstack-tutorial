import { IUserInstance, ITripInstance } from './../utils';
const { DataSource } = require('apollo-datasource');
const isEmail = require('isemail');

//TODO: so much work to do here...

export class UserAPI extends DataSource {
  constructor({ store } : any) {
    super();
    this.store = store;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config : any) {
    this.context = config.context;
  }

  /**
   * User can be called with an argument that includes email, but it doesn't
   * have to be. If the user is already on the context, it will use that user
   * instead
   */
  public async findOrCreateUser({ email: emailArg } : {email : string | null} = { email: null}) : Promise<IUserInstance | null> {
    const email : string =
      this.context && this.context.user ? this.context.user.email : emailArg;
    
    // If we are not valid, bail...
    if (!email || !isEmail.validate(email)) return null;

    const users : [IUserInstance, boolean] = await this.store.users.findOrCreate({ where: { email } });
    return users && users[0] ? users[0] : null;
  }

  public async bookTrips({ launchIds } : any) : Promise<Array<ITripInstance> | void>{
    const userId : number = this.context.user.id;
    if (!userId) return;

    let results : any = [];

    // for each launch id, try to book the trip and add it to the results array
    // if successful
    for (const launchId of launchIds) {
      const res = await this.bookTrip({ launchId });
      if (res) results.push(res);
    }

    return results;
  }

  public async bookTrip({ launchId } : any) : Promise<ITripInstance | boolean>{
    const userId : number = this.context.user.id;
    const res = await this.store.trips.findOrCreate({
      where: { userId, launchId },
    });
    return res && res.length ? res[0].get() : false;
  }

  public async cancelTrip({ launchId } : any) : Promise<boolean> {
    const userId = this.context.user.id;
    return !!this.store.trips.destroy({ where: { userId, launchId } });
  }

  public async getLaunchIdsByUser() : Promise<Array<number>> {
    const userId = this.context.user.id;
    const found = await this.store.trips.findAll({
      where: { userId },
    });
    return found && found.length
      ? found.map((l : any) => l.dataValues.launchId).filter((l : any) => !!l)
      : [];
  }

  public async isBookedOnLaunch({ launchId } : any) : Promise<boolean> {
    if (!this.context || !this.context.user) return false;
    const userId = this.context.user.id;
    const found = await this.store.trips.findAll({
      where: { userId, launchId },
    });
    return found && found.length > 0;
  }
}
