import pino from "pino";
import { MODULE } from "../consts/module";

const baseConfig = {
  name: MODULE
};

const devConfig:pino.LoggerOptions = {
  ...baseConfig,
  level: "debug",
};

const prodConfig = {
  ...baseConfig,
  level: "info",
  prettyPrint: false
};

export default pino(devConfig);
