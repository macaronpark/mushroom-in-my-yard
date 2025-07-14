export const Logger = {
  /**
   * Logs a message with a specific format.
   * @param {Object} params - The parameters for logging.
   * @param {string} params.from - The source of the log.
   * @param {string} params.msg - The message to log.
   * @param {Object} [params.data] - Additional data to log.
   */
  log: ({ from, msg, data }) => {
    if (!import.meta.env.DEV) return;

    console.log(
      '[LOG]' +
        `${from} ` +
        `${msg}` +
        (data ? `\n\n- data: ${JSON.stringify(data, null, 2)}` : ''),
    );
  },

  error: ({ from, msg, data, err }) => {
    if (!import.meta.env.DEV) return;

    console.error(
      `[ERROR]` +
        `${from} ` +
        `${msg}` +
        (data ? `\n\n- data: ${JSON.stringify(data, null, 2)}` : '') +
        (err ? `\n\n- error: ${err}` : ''),
    );
  },
};
