import { CONFIG } from './config';
import { EventBus } from './event-bus';

export const GameState = {
  fields: {
    'field-1': { id: 'field-1', mushroomID: null },
    'field-2': { id: 'field-2', mushroomID: null },
    'field-3': { id: 'field-3', mushroomID: null },
  },
  mushrooms: {},

  init() {
    this.bindEvent();
  },

  bindEvent() {
    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
      callback: (props) => {
        this.addNewMushroom(props);
      },
    });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
      callback: ({ mushroomID, nextGrowthStage }) =>
        this.updateMushroomGrowthStage({
          mushroomID,
          nextGrowthStage,
        }),
    });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
      callback: ({ fieldID, mushroomID }) =>
        this.deleteMushroom({
          fieldID,
          mushroomID,
        }),
    });
  },

  // Getters
  getState() {
    return {
      fields: { ...this.fields },
      mushrooms: { ...this.mushrooms },
    };
  },

  getField({ fieldID }) {
    const field = this.fields[fieldID];

    return { ...field };
  },

  getMushroomList() {
    const mushroomList = Object.values(this.mushrooms);

    return [...mushroomList];
  },

  getMushroom({ mushroomID }) {
    const mushroom = this.mushrooms[mushroomID];

    return { ...mushroom };
  },

  // Setters
  addNewMushroom(props) {
    const { fieldID, id: mushroomID } = props;
    const prevField = this.fields[fieldID];
    const prevMushroom = this.mushrooms[mushroomID];

    this.fields = {
      ...this.fields,
      [fieldID]: {
        ...prevField,
        mushroomID,
      },
    };

    this.mushrooms = {
      ...this.mushrooms,
      [mushroomID]: {
        ...prevMushroom,
        ...props,
      },
    };

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.UI_MANAGER.RENDER,
    });
  },

  updateMushroomGrowthStage({ mushroomID, nextGrowthStage }) {
    const prevMushroom = this.mushrooms[mushroomID];

    this.mushrooms = {
      ...this.mushrooms,
      [mushroomID]: {
        ...prevMushroom,
        growthStage: nextGrowthStage,
      },
    };

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.UI_MANAGER.RENDER,
    });
  },

  deleteMushroom({ fieldID, mushroomID }) {
    const prevField = this.fields[fieldID];

    this.fields = {
      ...this.fields,
      [fieldID]: {
        ...prevField,
        mushroomID: null,
      },
    };

    const { [mushroomID]: _, ...restMushrooms } = this.mushrooms;
    this.mushrooms = restMushrooms;

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.UI_MANAGER.RENDER,
    });
  },
};

const FROM = CONFIG.MODULE_ID.GAME_STATE;
