import { CONFIG } from './config';

class Mushroom {
  constructor({ type, fieldId, plantedTime }) {
    const { id, name, rarity, growthTime } = CONFIG.MUSHROOM[type];

    this.id = id;
    this.name = name;
    this.rarity = rarity;
    this.growthStage = CONFIG.GROWTH_STAGE.MYCELIUM;
    this.myceliumToFruiting = growthTime.myceliumToFruiting;
    this.fruitingToMature = growthTime.fruitingToMature;
    this.fieldId = fieldId;
    this.plantedTime = plantedTime;
  }

  startGrowthTimer({ stage }) {
    // 타이머 시작

    if (stage === CONFIG.GROWTH_STAGE.MYCELIUM) {
      // 균사 -> 자실체 형성
    }
  }

  growToNextStage() {
    // 다음 단계로 성장
  }

  destructor() {
    // 타이머 정리
  }
}
