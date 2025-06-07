/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: "Beatsnipe Server",
      script: "./src/server.ts",
      interpreter: "bun",
      env: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
      },
    },
    {
      name: "Beatsnipe Listener",
      script: "./src/listener.ts",
      interpreter: "bun",
      env: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
      },
    },
  ],
}
