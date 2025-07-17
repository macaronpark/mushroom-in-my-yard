import { CONFIG } from './config.js';
import { EventBus } from './event-bus.js';
import { Logger } from './logger.js';
import { Mushroom } from './mushroom.js';

export const GameLogic = {
  init() {
    Logger.log({ from: FROM, msg: '🐣 init' });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.FIELD_CLICKED,
      callback: ({ fieldID, isEmpty }) => {
        if (!isEmpty) return;
        this.plant({ fieldID });
      },
    });
  },

  plant({ fieldID }) {
    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.SET_NEW_MUSHROOM,
      data: { mushroom: new Mushroom({ fieldID }) },
    });
  },
};

const FROM = CONFIG.MODULE_ID.GAME_LOGIC;
