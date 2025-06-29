module.exports = {
  apps: [
    {
      name: 'turkish-learning-admin',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/turkish-learning-admin',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        NEXT_PUBLIC_API_URL: 'https://yourdomain.com/api',
        NEXT_PUBLIC_APP_NAME: 'Turkish Learning Admin',
        NEXT_PUBLIC_APP_VERSION: '1.0.0',
        NEXT_PUBLIC_APP_ENV: 'production'
      },
      error_file: '/var/log/pm2/turkish-learning-admin-error.log',
      out_file: '/var/log/pm2/turkish-learning-admin-out.log',
      log_file: '/var/log/pm2/turkish-learning-admin.log',
      time: true
    }
  ]
};
