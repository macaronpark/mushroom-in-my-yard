import { CONFIG } from './config.js';
import { EventBus } from './event-bus.js';
import { GameState } from './game-state.js';
import { Mushroom } from './mushroom.js';

export const GameLogic = {
  init() {
    this.setGameLoop();
    this.bindEvents();
  },

  setGameLoop() {
    setInterval(() => this.growthCheck(), 1000);
  },

  bindEvents() {
    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_LOGIC.FIELD_CLICKED,
      callback: ({ fieldID }) => this.handleFieldClick({ fieldID }),
    });
  },

  handleFieldClick({ fieldID }) {
    const { mushroomID } = GameState.getField({ fieldID });

    if (!mushroomID) {
      this.plantNewMushroom({ fieldID });
      return;
    }

    const mushroom = GameState.getMushroom({ mushroomID });
    if (mushroom.growthStage !== CONFIG.GROWTH_STAGE.MATURE) {
      return;
    }

    this.harvestMushroom({ fieldID, mushroomID: mushroom.id });
  },

  growthCheck() {
    const mushroomList = GameState.getMushroomList();

    mushroomList.forEach((mushroom) => {
      if (!mushroom) return;

      const { fieldID, plantedAt, growthTime, growthStage } = mushroom;
      const now = Date.now();

      if (!this.shouldGrow({ plantedAt, growthTime, growthStage, now })) return;

      this.growTo({
        fieldID,
        mushroomID: mushroom.id,
        nextGrowthStage:
          growthStage === CONFIG.GROWTH_STAGE.MYCELIUM
            ? CONFIG.GROWTH_STAGE.FRUITING
            : CONFIG.GROWTH_STAGE.MATURE,
      });
    });
  },

  shouldGrow({ plantedAt, growthTime, growthStage, now }) {
    if (growthStage === CONFIG.GROWTH_STAGE.MATURE) return false;

    const requiredTimeForCurrentStage =
      growthStage === CONFIG.GROWTH_STAGE.MYCELIUM
        ? growthTime.myceliumToFruiting
        : growthTime.fruitingToMature;

    const elapsed = now - plantedAt;

    return elapsed >= requiredTimeForCurrentStage;
  },

  growTo({ mushroomID, nextGrowthStage }) {
    EventBus.emit({
      from: CONFIG.MODULE_ID.GAME_LOGIC,
      e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
      data: { mushroomID, nextGrowthStage },
    });
  },

  plantNewMushroom({ fieldID }) {
    const newMushroom = new Mushroom({
      fieldID,
      mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
    });

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
      data: { ...newMushroom },
    });
  },

  harvestMushroom({ fieldID, mushroomID }) {
    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
      data: { fieldID, mushroomID },
    });
  },
};

const FROM = CONFIG.MODULE_ID.GAME_LOGIC;
