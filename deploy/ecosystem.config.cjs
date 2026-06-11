/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "termiz",
      cwd: "/var/www/termiz",
      script: "deploy/start.sh",
      interpreter: "bash",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
