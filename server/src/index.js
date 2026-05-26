import { createServer } from "./app.js";
import {
  getOracleArgs,
  getOracleCommand,
  getOracleCommandArgs,
} from "./config.js";
import { createOracleRunner } from "./oracle-runner.js";

const port = Number.parseInt(process.env.LREACHOUT_PORT ?? "17391", 10);
const host = process.env.LREACHOUT_HOST ?? "127.0.0.1";
const profilePath = process.env.LREACHOUT_PROFILE_PATH ?? "profile/me.md";
const playbookPath = process.env.LREACHOUT_PLAYBOOK_PATH ?? "prompts/hiring.md";

const server = createServer({
  profilePath,
  playbookPath,
  oracleRunner: createOracleRunner({
    command: getOracleCommand(),
    baseArgs: [...getOracleCommandArgs(), ...getOracleArgs()],
  }),
});

server.listen(port, host, () => {
  console.log(`lreachout server listening on http://${host}:${port}`);
  console.log(`lreachout profile: ${profilePath}`);
  console.log(`lreachout playbook: ${playbookPath}`);
  console.log(`lreachout oracle command: ${getOracleCommand()}`);
  console.log(`lreachout oracle args: ${[...getOracleCommandArgs(), ...getOracleArgs()].join(" ")}`);
});
