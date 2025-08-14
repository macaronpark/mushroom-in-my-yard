import CONFIG from './config.js';
import EventBus from './event-bus.js';
import GameState from './game-state.js';
import Mushroom from './mushroom.js';

const GameLogic = createGameLogic();
export default GameLogic;

function createGameLogic() {
  const bindEvents = () => {
    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_LOGIC.FIELD_CLICKED,
      callback: ({ fieldID }) => handleFieldClick({ fieldID }),
    });
  };

  return {
    init() {
      bindEvents();
    },
  };
}

export function handleFieldClick({ fieldID }) {
  const field = GameState.getField({ fieldID });

  if (!field.mushroomID) {
    const mushroomType = getRandomMushroomType();
    const newMushroom = new Mushroom({ fieldID, mushroomType });

    plant({ mushroom: newMushroom });
    return;
  }

  const mushroom = GameState.getMushroom({ mushroomID: field.mushroomID });
  const isGrowing = mushroom.growthStage !== CONFIG.GROWTH_STAGE.MATURE;
  if (isGrowing) return;

  harvest({ fieldID, mushroomID: mushroom.id });
}

export function getRandomMushroomType({
  mushroomConfig = CONFIG.MUSHROOM,
  rng = Math.random,
} = {}) {
  const types = Object.keys(mushroomConfig);
  const weights = types.map((type) => mushroomConfig[type].rarity);

  const cumulativeWeights = weights.reduce((acc, cur, i) => {
    const value = i === 0 ? cur : acc[i - 1] + cur;
    acc.push(value);

    return acc;
  }, []);

  const maxNum = cumulativeWeights[cumulativeWeights.length - 1];
  const randomNum = rng() * maxNum;

  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (randomNum < cumulativeWeights[i]) {
      return types[i];
    }
  }
}

export function getNextGrowthStage({ current }) {
  const { MYCELIUM, FRUITING, MATURE } = CONFIG.GROWTH_STAGE;

  switch (current) {
    case MYCELIUM:
      return FRUITING;

    case FRUITING:
      return MATURE;

    default:
      return null;
  }
}

function plant({ mushroom }) {
  EventBus.emit({
    from: FROM,
    e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
    data: { ...mushroom },
  });

  const { schedule } = createScheduler({ growTo });
  schedule({
    mushroomID: mushroom.id,
    current: mushroom.growthStage,
    growthTime: mushroom.growthTime,
  });
}

function createScheduler({ growTo }) {
  let timerID = null;

  const schedule = ({ mushroomID, current, growthTime }) => {
    clearTimer();

    const nextGrowthStage = getNextGrowthStage({ current });
    if (!nextGrowthStage) return;

    const delay =
      current === CONFIG.GROWTH_STAGE.MYCELIUM
        ? growthTime.myceliumToFruiting
        : growthTime.fruitingToMature;

    timerID = setTimeout(() => {
      growTo({ mushroomID, nextGrowthStage });
      schedule({ mushroomID, current: nextGrowthStage, growthTime });
    }, delay);
  };

  function clearTimer() {
    if (!timerID) return;

    clearTimeout(timerID);
    timerID = null;
  }

  return { schedule };
}

function growTo({ mushroomID, nextGrowthStage }) {
  EventBus.emit({
    from: CONFIG.MODULE_ID.GAME_LOGIC,
    e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
    data: { mushroomID, nextGrowthStage },
  });
}

function harvest({ fieldID, mushroomID }) {
  EventBus.emit({
    from: FROM,
    e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
    data: { fieldID, mushroomID },
  });
}

const FROM = CONFIG.MODULE_ID.GAME_LOGIC;
