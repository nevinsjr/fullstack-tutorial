import * as SQL from 'sequelize';

export const paginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
  // can pass in a function to calculate an item's cursor
  getCursor = (item ?: any) => null,
}) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);
  const cursorIndex = results.findIndex(item => {
    // if an item has a `cursor` on it, use that, otherwise try to generate one
    let itemCursor = item.cursor ? item.cursor : getCursor(item);

    // if there's still not a cursor, return false by default
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1 // don't let us overflow
      ? []
      : results.slice(
          cursorIndex + 1,
          Math.min(results.length, cursorIndex + 1 + pageSize),
        )
    : results.slice(0, pageSize);
};


// TODO: refactor this portion of the tutorial out of utils

type SequelizeAttribute = string | SQL.DataTypeAbstract | SQL.DefineAttributeColumnOptions;

export type SequelizeAttributes<T extends { [key: string]: any }> = {
  [P in keyof T]: SequelizeAttribute
};


export interface IUserAttributes {
  id ?: number,
  createdAt ?: Date,
  updatedAt ?: Date,
  email : string,
  token ?: string,
}

export interface IUserInstance extends SQL.Instance<IUserAttributes>, IUserAttributes {}


export interface ITripAttributes {
  id ?: number,
  createdAt ?: Date,
  updatedAt ?: Date,
  launchId ?: Date,
  userId ?: Date,
}

export interface ITripInstance extends SQL.Instance<ITripAttributes>, ITripAttributes {}

export const createStore = () => {
  const Op = SQL.Op;
  const operatorsAliases = {
    $in: Op.in,
  };

  // const db = new SQL('database', 'username', 'password', {
  const db = new SQL.default('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: './store.sqlite',
    operatorsAliases,
    logging: false,
  });

  /* Users */

  const userAttributes : SequelizeAttributes<IUserAttributes> = {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    email: SQL.STRING,
    token: SQL.STRING,
  };

  const users : SQL.Model<IUserInstance, IUserAttributes> = db.define<IUserInstance, IUserAttributes>('user', userAttributes);

  /* Trips */

  const tripAttributes : SequelizeAttributes<ITripAttributes> = {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    launchId: SQL.INTEGER,
    userId: SQL.INTEGER,
  }

  const trips : SQL.Model<ITripInstance, ITripAttributes> = db.define<ITripInstance, ITripAttributes>('trip', tripAttributes);

  return { users, trips };
};
