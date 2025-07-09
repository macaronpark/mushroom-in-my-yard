import { CONFIG } from './config';
import { EventBus } from './event-bus';
import { Logger } from './logger';

export const GameState = {
  field: {
    list: [
      {
        id: 'field-1',
        mushroomType: null,
        plantedTime: null,
      },
      {
        id: 'field-2',
        mushroomType: null,
        plantedTime: null,
      },
      {
        id: 'field-3',
        mushroomType: null,
        plantedTime: null,
      },
    ],

    get(data) {
      return this.list.find((f) => f.id === data.fieldID);
    },

    set(data) {
      const { fieldID, mushroomType, plantedTime } = data;
      const field = this.get(data);

      if (!field) {
        Logger.error({
          from: FROM,
          msg: `❌ set: field not found for ${fieldID}`,
          data,
        });

        return;
      }

      field.mushroomType = mushroomType;
      field.plantedTime = plantedTime;

      Logger.log({
        from: FROM,
        msg: `✅ field.set`,
        data,
      });
    },
  },

  init() {
    Logger.log({
      from: FROM,
      msg: '🐣 init',
    });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.FIELD.SET,
      callback: (data) => {
        this.field.set(data);

        EventBus.emit({
          from: FROM,
          e: CONFIG.EVENT_ID.FIELD.UPDATED,
          data,
        });
      },
    });
  },
};

const FROM = CONFIG.MODULE_ID.GAME_STATE;
