export function createLogger(scope = "app") {
  function write(level, message, details) {
    const suffix = details ? ` ${JSON.stringify(details)}` : "";
    console[level === "error" ? "error" : "log"](`[${scope}] ${message}${suffix}`);
  }

  return {
    info(message, details) {
      write("info", message, details);
    },
    warn(message, details) {
      write("warn", message, details);
    },
    error(message, details) {
      write("error", message, details);
    }
  };
}
