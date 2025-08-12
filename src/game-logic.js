import CONFIG from './config.js';
import EventBus from './event-bus.js';
import GameState from './game-state.js';
import Mushroom from './mushroom.js';

const GameLogic = createGameLogic();
export default GameLogic;

function createGameLogic() {
  const setGameLoop = () => {
    setInterval(() => checkMushroomGrowth(), 1000);
  };

  const bindEvents = () => {
    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_LOGIC.FIELD_CLICKED,
      callback: ({ fieldID }) => handleFieldClick({ fieldID }),
    });
  };

  return {
    init() {
      setGameLoop();
      bindEvents();
    },
  };
}

export function handleFieldClick({ fieldID }) {
  const { mushroomID } = GameState.getField({ fieldID });

  if (!mushroomID) {
    plantNewMushroom({ fieldID });
    return;
  }

  const mushroom = GameState.getMushroom({ mushroomID });
  if (mushroom.growthStage !== CONFIG.GROWTH_STAGE.MATURE) {
    return;
  }

  harvestMushroom({ fieldID, mushroomID: mushroom.id });
}

export function checkMushroomGrowth() {
  const mushroomList = GameState.getMushroomList();

  mushroomList.forEach((mushroom) => {
    const { fieldID, plantedAt, growthTime, growthStage } = mushroom;
    const now = Date.now();

    if (!shouldMushroomGrow({ plantedAt, growthTime, growthStage, now }))
      return;

    const nextGrowthStage = getNextGrowthStage({
      current: growthStage,
    });

    if (!nextGrowthStage) return;

    growTo({
      fieldID,
      mushroomID: mushroom.id,
      nextGrowthStage,
    });
  });
}

export function shouldMushroomGrow({
  plantedAt,
  growthTime,
  growthStage,
  now,
}) {
  if (growthStage === CONFIG.GROWTH_STAGE.MATURE) return false;

  const requiredTimeForCurrentStage =
    growthStage === CONFIG.GROWTH_STAGE.MYCELIUM
      ? growthTime.myceliumToFruiting
      : growthTime.fruitingToMature;

  const elapsed = now - plantedAt;

  return elapsed >= requiredTimeForCurrentStage;
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

export function growTo({ mushroomID, nextGrowthStage }) {
  EventBus.emit({
    from: CONFIG.MODULE_ID.GAME_LOGIC,
    e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
    data: { mushroomID, nextGrowthStage },
  });
}

export function plantNewMushroom({ fieldID }) {
  const newMushroom = new Mushroom({
    fieldID,
    mushroomType: getRandomMushroomType(),
  });

  EventBus.emit({
    from: FROM,
    e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
    data: { ...newMushroom },
  });
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

export function harvestMushroom({ fieldID, mushroomID }) {
  EventBus.emit({
    from: FROM,
    e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
    data: { fieldID, mushroomID },
  });
}

const FROM = CONFIG.MODULE_ID.GAME_LOGIC;
