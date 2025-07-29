import { CONFIG } from './config';
import { EventBus } from './event-bus';

export class Mushroom {
  #growthTimerID;

  constructor({ fieldID }) {
    const { id, type, name, rarity, growthTime } = CONFIG.MUSHROOM.RED_CAP;

    this.fieldID = fieldID;
    this.plantedTime = Date.now();
    this.id = fieldID + '_' + id;
    this.type = type;
    this.name = name;
    this.rarity = rarity;
    this.growthStage = CONFIG.GROWTH_STAGE.MYCELIUM;
    this.growthTime = growthTime;
    this.#growthTimerID = null;

    this.#scheduleNextGrowth();
  }

  #scheduleNextGrowth() {
    const currentStage = this.growthStage;
    const { myceliumToFruiting, fruitingToMature } = this.growthTime;

    this.#clearTimer();

    switch (currentStage) {
      case CONFIG.GROWTH_STAGE.MYCELIUM: {
        this.#growthTimerID = setTimeout(() => {
          this.#growTo({ nextStage: CONFIG.GROWTH_STAGE.FRUITING });
          this.#scheduleNextGrowth();
        }, myceliumToFruiting);
        break;
      }

      case CONFIG.GROWTH_STAGE.FRUITING: {
        this.#growthTimerID = setTimeout(() => {
          this.#growTo({ nextStage: CONFIG.GROWTH_STAGE.MATURE });
          this.#scheduleNextGrowth();
        }, fruitingToMature);
        break;
      }

      case CONFIG.GROWTH_STAGE.MATURE: {
        break;
      }
    }
  }

  #growTo({ nextStage }) {
    EventBus.emit({
      from: CONFIG.MODULE_ID.mushroom({ id: this.id }),
      e: CONFIG.EVENT_ID.UPDATE_MUSHROOM_GROWTH_STAGE,
      data: { fieldID: this.fieldID, nextGrowthStage: nextStage },
    });
  }

  #clearTimer() {
    if (!this.#growthTimerID) return;

    clearTimeout(this.#growthTimerID);
    this.#growthTimerID = null;
  }

  destroy() {
    this.#clearTimer();
  }
}
