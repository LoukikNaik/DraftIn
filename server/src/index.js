import { createServer } from "./app.js";
import {
  getOracleArgs,
  getOracleCommand,
  getOracleCommandArgs,
} from "./config.js";
import { createOracleRunner } from "./oracle-runner.js";

const port = Number.parseInt(process.env.DRAFTIN_PORT ?? "17391", 10);
const host = process.env.DRAFTIN_HOST ?? "127.0.0.1";
const profilePath = process.env.DRAFTIN_PROFILE_PATH ?? "profile/me.md";

const server = createServer({
  profilePath,
  oracleRunner: createOracleRunner({
    command: getOracleCommand(),
    baseArgs: [...getOracleCommandArgs(), ...getOracleArgs()],
  }),
});

server.listen(port, host, () => {
  console.log(`draftin server listening on http://${host}:${port}`);
  console.log(`draftin profile: ${profilePath}`);
  console.log(`draftin oracle command: ${getOracleCommand()}`);
  console.log(`draftin oracle args: ${[...getOracleCommandArgs(), ...getOracleArgs()].join(" ")}`);
});
