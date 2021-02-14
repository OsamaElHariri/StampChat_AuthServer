const path = require('path');

const BASE_PATH = path.join(__dirname, 'src', 'server', 'db');

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://some_user:password@localhost:5400/stamp_chat',
    migrations: {
      directory: path.join(BASE_PATH, 'migrations')
    },
  },
  prod: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.join(BASE_PATH, 'migrations')
    },
  }
};
