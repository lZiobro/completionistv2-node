// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: "verceldb",
      user: process?.env?.POSTGRES_USER,
      password: process?.env?.POSTGRES_PASSWORD,
    },
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./api/seeds",
    },
    useNullAsDefault: true,
  },
  // module.exports = {
  // development: {
  //   client: "sqlite3",
  //   connection: {
  //     filename: "./db/completionist.db3",
  //   },
  //   migrations: {
  //     directory: "./db/migrations",
  //   },
  //   seeds: {
  //     directory: "./api/seeds",
  //   },
  //   useNullAsDefault: true,
  // },

  // staging: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // }
};
