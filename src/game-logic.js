import { CONFIG } from './config.js';
import { EventBus } from './event-bus.js';
import { Mushroom } from './mushroom.js';

export const GameLogic = {
  init() {
    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.FIELD_CLICKED,
      callback: this.plantNewMushroom,
    });
  },

  plantNewMushroom({ fieldID }) {
    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.SET_NEW_MUSHROOM,
      data: {
        mushroom: new Mushroom({
          fieldID,
          mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
        }),
      },
    });
  },
};

const FROM = CONFIG.MODULE_ID.GAME_LOGIC;
