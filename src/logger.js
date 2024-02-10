import pino from "pino";

const levels = {
  error: 25,
  block: 30,
  allow: 35,
  info: 40,
};

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      customLevels: "error:25,block:30,allow:35,info:40",
      customColors: "error:red,block:yellow,allow:green,info:white",
    },
  },
  customLevels: levels,
  useOnlyCustomLevels: true,
  level: "error",
});

export default logger;
