import { CONFIG } from './config.js';
import { EventBus } from './event-bus.js';
import { Logger } from './logger.js';

export const GameLogic = {
  init() {
    Logger.log({
      from: FROM,
      msg: '🐣 init',
    });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.FIELD.CLICKED,
      callback: (data) => {
        const { fieldID, isEmpty } = data;
        if (!isEmpty) return;

        this.plant(fieldID);
      },
    });
  },

  plant(fieldID) {
    const data = {
      fieldID,
      mushroomType: 'redcap',
      plantedTime: Date.now(),
    };

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.FIELD.SET,
      data,
    });
  },
};

const FROM = CONFIG.MODULE_ID.GAME_LOGIC;
