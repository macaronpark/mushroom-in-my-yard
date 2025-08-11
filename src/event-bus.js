import { Logger } from './logger.js';

export const createEventBus = () => {
  let events = {};

  return {
    on({ from, e, callback }) {
      if (!events[e]) {
        events[e] = [];
      }

      events[e].push(callback);

      Logger.log({
        from,
        msg: `➕ EventBus.on: ${e}`,
      });
    },

    emit({ from, e, data }) {
      try {
        events[e].forEach((cb, idx) => {
          try {
            Logger.log({
              from,
              msg: `✅ EventBus.emit: ${e}[${idx}]`,
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

    getEvents() {
      return { ...events };
    },
  };
};

const EventBus = createEventBus();
export default EventBus;
