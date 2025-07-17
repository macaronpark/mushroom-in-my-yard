import { Logger } from './logger.js';

export const EventBus = {
  events: {},

  on({ from, e, callback }) {
    if (!this.events[e]) {
      this.events[e] = [];
    }

    this.events[e].push(callback);

    Logger.log({
      from,
      msg: `➕ EventBus.on: ${e}`,
    });
  },

  emit({ from, e, data }) {
    try {
      this.events[e].forEach((cb, idx) => {
        try {
          Logger.log({
            from,
            msg: `🔥 EventBus.emit: ${e}[${idx}]`,
            data,
          });

          cb(data);
        } catch (err) {
          Logger.error({
            from,
            msg: `❌ EventBus.emit: ${e}, callback: ${cb}`,
            data,
            err,
          });
        }
      });
    } catch (err) {
      Logger.error({
        from,
        msg: `❌ EventBus.emit: ${e} not found`,
        data,
        err,
      });
    }
  },
};
