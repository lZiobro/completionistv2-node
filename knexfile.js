// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
// module.exports = {
// development: {
//   client: "pg",
//   connection: {
//     host: "ep-white-lab-a2u8yygp-pooler.eu-central-1.aws.neon.tech",
//     user: "default",
//     password: "C61xOnapKYfl",
//     database: "verceldb",
//     ssl: { rejectUnauthorized: false },
//   },
//   migrations: {
//     directory: "./db/migrations",
//   },
//   seeds: {
//     directory: "./api/seeds",
//   },
//   useNullAsDefault: true,
// },
module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./db/completionist.db3",
    },
    migrations: {
      directory: "./db/migrations",
    },
    seeds: {
      directory: "./api/seeds",
    },
    useNullAsDefault: true,
  },

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
