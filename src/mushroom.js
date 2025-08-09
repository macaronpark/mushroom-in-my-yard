import CONFIG from './config';

export default class Mushroom {
  constructor({ fieldID, mushroomType }) {
    const { id, type, name, rarity, growthTime } =
      CONFIG.MUSHROOM[mushroomType];

    this.fieldID = fieldID;
    this.id = fieldID + '_' + id;
    this.type = type;
    this.name = name;
    this.rarity = rarity;
    this.plantedAt = Date.now();
    this.growthTime = growthTime;
    this.growthStage = CONFIG.GROWTH_STAGE.MYCELIUM;
  }
}
