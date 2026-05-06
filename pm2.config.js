module.exports = {
  apps: [
    {
      name: "fitness-roadmap-nextjs",
      script: "cmd.exe",
      args: ["/c", "npm run start"],
      interpreter: "none",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "./logs/nextjs-error.log",
      out_file: "./logs/nextjs-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      max_memory_restart: "1G",
    },
  ],
};
