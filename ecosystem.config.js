// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: "Beatsnipe Server",
      script: "./src/server.ts",
      interpreter: "~/.bun/bin/bun",
    },
    {
      name: "Beatsnipe Listener",
      script: "./src/listener.ts",
      interpreter: "~/.bun/bin/bun",
    },
  ],
}
