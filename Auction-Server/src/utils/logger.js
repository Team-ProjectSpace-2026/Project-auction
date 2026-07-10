const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug")] ?? 2;

const formatTimestamp = () => new Date().toISOString();

const formatMessage = (level, msg, meta) => {
  const base = JSON.stringify({
    level,
    timestamp: formatTimestamp(),
    message: msg,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
  });
  return base;
};

const logger = {
  error: (msg, meta) => {
    if (currentLevel >= LOG_LEVELS.error) console.error(formatMessage("error", msg, meta));
  },
  warn: (msg, meta) => {
    if (currentLevel >= LOG_LEVELS.warn) console.warn(formatMessage("warn", msg, meta));
  },
  info: (msg, meta) => {
    if (currentLevel >= LOG_LEVELS.info) console.log(formatMessage("info", msg, meta));
  },
  debug: (msg, meta) => {
    if (currentLevel >= LOG_LEVELS.debug) console.log(formatMessage("debug", msg, meta));
  },
  // HTTP request logger middleware (lightweight Morgan replacement)
  requestMiddleware: (req, res, next) => {
    const start = Date.now();
    const { method, url } = req;

    res.on("finish", () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      logger[level](`${method} ${url} ${res.statusCode}`, {
        duration: `${duration}ms`,
        ip: req.ip,
        userId: req.user?.id,
      });
    });

    next();
  },
};

export default logger;
