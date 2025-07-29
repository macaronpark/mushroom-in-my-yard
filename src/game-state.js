import { CONFIG } from './config';
import { EventBus } from './event-bus';
import { Logger } from './logger';

export const GameState = {
  fieldList: [
    {
      id: 'field-1',
      mushroom: null,
    },
    {
      id: 'field-2',
      mushroom: null,
    },
    {
      id: 'field-3',
      mushroom: null,
    },
  ],

  init() {
    Logger.log({ from: FROM, msg: '🐣 init' });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.SET_NEW_MUSHROOM,
      callback: ({ mushroom }) => {
        this.setNewMushroom({ mushroom });
      },
    });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.UPDATE_MUSHROOM_GROWTH_STAGE,
      callback: ({ fieldID, nextGrowthStage }) =>
        this.updateMushroomGrowthStage({
          fieldID,
          nextGrowthStage,
        }),
    });
  },

  getField({ fieldID }) {
    const field = this.fieldList.find((f) => f.id === fieldID);

    if (!field) {
      Logger.error({ from: FROM, msg: `❌ getField: ${fieldID} not found` });
      return;
    }

    return field;
  },

  setNewMushroom({ mushroom }) {
    const field = this.getField({ fieldID: mushroom.fieldID });
    field.mushroom = mushroom;

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.RENDER_MUSHROOM,
      data: { mushroom },
    });
  },

  updateMushroomGrowthStage({ fieldID, nextGrowthStage }) {
    const field = this.getField({ fieldID });
    if (!field) return;

    field.mushroom.growthStage = nextGrowthStage;

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.RENDER_MUSHROOM,
      data: { mushroom: field.mushroom },
    });
  },
};

const FROM = CONFIG.MODULE_ID.GAME_STATE;
