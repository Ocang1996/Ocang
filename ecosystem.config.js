module.exports = {
  apps: [
    {
      name: 'asn-dashboard-api',
      script: 'server/dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'asn-dashboard-frontend',
      script: 'serve',
      args: ['-s', 'dist', '-l', '3000'],
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}; 