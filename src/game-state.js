import CONFIG from './config';
import EventBus from './event-bus';

export const createGameState = () => {
  let fields = {
    'field-1': { id: 'field-1', mushroomID: null },
    'field-2': { id: 'field-2', mushroomID: null },
    'field-3': { id: 'field-3', mushroomID: null },
  };

  let mushrooms = {};

  const bindEvents = () => {
    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
      callback: addNewMushroom,
    });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
      callback: updateMushroomGrowthStage,
    });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
      callback: deleteMushroom,
    });
  };

  const addNewMushroom = (props) => {
    const { fieldID, id: mushroomID } = props;
    const prevField = fields[fieldID];
    const prevMushroom = mushrooms[mushroomID];

    fields = {
      ...fields,
      [fieldID]: {
        ...prevField,
        mushroomID,
      },
    };

    mushrooms = {
      ...mushrooms,
      [mushroomID]: {
        ...prevMushroom,
        ...props,
      },
    };

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.UI_MANAGER.RENDER,
    });
  };

  const updateMushroomGrowthStage = ({ mushroomID, nextGrowthStage }) => {
    const prevMushroom = mushrooms[mushroomID];

    mushrooms = {
      ...mushrooms,
      [mushroomID]: {
        ...prevMushroom,
        growthStage: nextGrowthStage,
      },
    };

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.UI_MANAGER.RENDER,
    });
  };

  const deleteMushroom = ({ fieldID, mushroomID }) => {
    const prevField = fields[fieldID];

    fields = {
      ...fields,
      [fieldID]: {
        ...prevField,
        mushroomID: null,
      },
    };

    const { [mushroomID]: _, ...restMushrooms } = mushrooms;
    mushrooms = restMushrooms;

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.UI_MANAGER.RENDER,
    });
  };

  return {
    init() {
      bindEvents();
    },

    getState() {
      return {
        fields: { ...fields },
        mushrooms: { ...mushrooms },
      };
    },

    getField({ fieldID }) {
      const field = fields[fieldID];
      return { ...field };
    },

    getMushroomList() {
      const mushroomList = Object.values(mushrooms);
      return [...mushroomList];
    },

    getMushroom({ mushroomID }) {
      const mushroom = mushrooms[mushroomID];
      return { ...mushroom };
    },
  };
};

const GameState = createGameState();
export default GameState;

const FROM = CONFIG.MODULE_ID.GAME_STATE;
