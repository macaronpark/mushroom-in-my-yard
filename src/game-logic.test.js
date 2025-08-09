import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EventBus from './event-bus';
import GameLogic from './game-logic';
import GameState from './game-state';
import { CONFIG } from './config';
import { Mushroom } from './mushroom';

let spyOnEmit;
let spyOnGetField;
let spyOnGetMushroom;

beforeEach(() => {
  spyOnEmit = vi.spyOn(EventBus, 'emit');
  spyOnGetField = vi.spyOn(GameState, 'getField');
  spyOnGetMushroom = vi.spyOn(GameState, 'getMushroom');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('handleFieldClick', () => {
  const fieldID = 'field-1';
  const mushroom = new Mushroom({
    fieldID,
    mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
  });

  it('버섯이 없으면 새 버섯을 심는 이벤트를 발생시킨다', () => {
    GameLogic.handleFieldClick({ fieldID });

    expect(spyOnEmit).toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG.MODULE_ID.GAME_LOGIC,
        e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
      }),
    );
  });

  it('버섯이 성장 중이라면 수확 이벤트를 발생시키지 않는다', () => {
    spyOnGetField.mockReturnValue({
      fieldID,
      mushroomID: mushroom.id,
    });
    spyOnGetMushroom.mockReturnValue({
      ...mushroom,
      growthStage: CONFIG.GROWTH_STAGE.MYCELIUM,
    });

    GameLogic.handleFieldClick({ fieldID });

    expect(spyOnEmit).not.toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG.MODULE_ID.GAME_LOGIC,
        e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
      }),
    );
  });

  it('버섯이 성숙 단계라면 수확 이벤트를 발생시킨다', () => {
    spyOnGetField.mockReturnValue({
      fieldID,
      mushroomID: mushroom.id,
    });
    spyOnGetMushroom.mockReturnValue({
      ...mushroom,
      growthStage: CONFIG.GROWTH_STAGE.MATURE,
    });

    GameLogic.handleFieldClick({ fieldID });

    expect(spyOnEmit).toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG.MODULE_ID.GAME_LOGIC,
        e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
      }),
    );
  });
});

describe('shouldGrow', () => {
  const MOCK_START_TIME = 1000000;
  const GROWTH_TIME = {
    myceliumToFruiting: 1000,
    fruitingToMature: 2000,
  };

  it('균사 단계에서 자실체로 성장할 시간이라면 true를 반환해야 한다', () => {
    const plantedAt = MOCK_START_TIME;
    const now = MOCK_START_TIME + 10000;
    const growthStage = CONFIG.GROWTH_STAGE.MYCELIUM;

    const result = GameLogic.shouldGrow({
      plantedAt,
      growthTime: GROWTH_TIME,
      growthStage,
      now,
    });

    expect(result).toBe(true);
  });

  it('자실체 단계에서 성숙으로 성장할 시간이 아니라면 false를 반환해야 한다', () => {
    const plantedAt = MOCK_START_TIME;
    const now = MOCK_START_TIME + 999;
    const growthStage = CONFIG.GROWTH_STAGE.FRUITING;

    const result = GameLogic.shouldGrow({
      plantedAt,
      growthTime: GROWTH_TIME,
      growthStage,
      now,
    });

    expect(result).toBe(false);
  });

  it('성숙 단계라면 false를 반환해야 한다', () => {
    const plantedAt = MOCK_START_TIME;
    const now = MOCK_START_TIME + 30000;
    const growthStage = CONFIG.GROWTH_STAGE.MATURE;

    const result = GameLogic.shouldGrow({
      plantedAt,
      growthTime: GROWTH_TIME,
      growthStage,
      now,
    });

    expect(result).toBe(false);
  });
});

it('growTo: 버섯 성장 이벤트를 트리거해야 한다', () => {
  const mushroomID = 'field-1_redcap';
  const nextGrowthStage = CONFIG.GROWTH_STAGE.FRUITING;

  GameLogic.growTo({ mushroomID, nextGrowthStage });

  expect(spyOnEmit).toHaveBeenCalledWith({
    from: CONFIG.MODULE_ID.GAME_LOGIC,
    e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
    data: {
      mushroomID,
      nextGrowthStage,
    },
  });
});

it('plantNewMushroom: 새로운 버섯을 심는 이벤트를 트리거해야 한다', () => {
  const fieldID = 'field-1';

  GameLogic.plantNewMushroom({ fieldID });

  expect(spyOnEmit).toHaveBeenCalledWith({
    from: CONFIG.MODULE_ID.GAME_LOGIC,
    e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
    data: {
      fieldID,
      growthStage: CONFIG.GROWTH_STAGE.MYCELIUM,
      growthTime: {
        fruitingToMature: expect.any(Number),
        myceliumToFruiting: expect.any(Number),
      },
      id: expect.any(String),
      name: expect.any(String),
      plantedAt: expect.any(Number),
      rarity: expect.any(Number),
      type: expect.any(String),
    },
  });
});
