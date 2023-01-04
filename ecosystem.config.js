module.exports = {
  apps: [
    {
      name: 'ProjectItern',
      script: 'npm',
      args: 'start',
      cwd: process.env.PWD,

      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      // args: 'one two',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],

  deploy: {
    development: {
      key: '',
      user: '',
      host: '',
      ref: 'origin/develop',
      repo: '',
      path: '',
      'post-deploy':
        'npm ci && pm2 startOrRestart ecosystem.config.js --env development',
    },
  },
};
