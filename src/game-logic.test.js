import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CONFIG from './config';
import EventBus from './event-bus';
import {
  shouldMushroomGrow,
  getNextGrowthStage,
  handleFieldClick,
  checkMushroomGrowth,
  growTo,
  plantNewMushroom,
  harvestMushroom,
  getRandomMushroomType,
} from './game-logic';
import GameState from './game-state';
import Mushroom from './mushroom';

let spyOnEmit;
let spyOnGetField;
let spyOnGetMushroom;
let spyOnGetMushroomList;

beforeEach(() => {
  spyOnEmit = vi.spyOn(EventBus, 'emit');
  spyOnGetField = vi.spyOn(GameState, 'getField');
  spyOnGetMushroom = vi.spyOn(GameState, 'getMushroom');
  spyOnGetMushroomList = vi.spyOn(GameState, 'getMushroomList');
});

afterEach(() => {
  vi.restoreAllMocks();
});

// 단위 테스트
describe('shouldMushroomGrow', () => {
  const MOCK_START_TIME = 1000000;
  const GROWTH_TIME = {
    myceliumToFruiting: 1000,
    fruitingToMature: 2000,
  };

  it('균사 단계에서 자실체로 성장할 시간이라면 true를 반환해야 한다', () => {
    const plantedAt = MOCK_START_TIME;
    const now = MOCK_START_TIME + 10000;
    const growthStage = CONFIG.GROWTH_STAGE.MYCELIUM;

    const result = shouldMushroomGrow({
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

    const result = shouldMushroomGrow({
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

    const result = shouldMushroomGrow({
      plantedAt,
      growthTime: GROWTH_TIME,
      growthStage,
      now,
    });

    expect(result).toBe(false);
  });
});

describe('getNextGrowthStage', () => {
  //Given
  it.each`
    currentGrowthStage              | expected
    ${CONFIG.GROWTH_STAGE.MYCELIUM} | ${CONFIG.GROWTH_STAGE.FRUITING}
    ${CONFIG.GROWTH_STAGE.FRUITING} | ${CONFIG.GROWTH_STAGE.MATURE}
    ${CONFIG.GROWTH_STAGE.MATURE}   | ${null}
  `(
    '$currentGrowthStage의 다음 단계는 $expected이다',
    ({ currentGrowthStage, expected }) => {
      // When
      const nextGrowthStage = getNextGrowthStage({
        current: currentGrowthStage,
      });

      // Then
      expect(nextGrowthStage).toBe(expected);
    },
  );
});

// 통합 테스트
describe('handleFieldClick', () => {
  // Given
  const fieldID = 'field-1';
  const mushroom = new Mushroom({
    fieldID,
    mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
  });

  it('버섯이 없으면 새 버섯을 심는 이벤트를 발생시킨다', () => {
    // Given
    spyOnGetField.mockReturnValue({ fieldID, mushroomID: null });

    // When
    handleFieldClick({ fieldID });

    // Then
    expect(spyOnEmit).toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG.MODULE_ID.GAME_LOGIC,
        e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
      }),
    );
  });

  it('버섯이 성장 중이라면 수확 이벤트를 발생시키지 않는다', () => {
    // Given
    spyOnGetField.mockReturnValue({
      fieldID,
      mushroomID: mushroom.id,
    });
    spyOnGetMushroom.mockReturnValue({
      ...mushroom,
      growthStage: CONFIG.GROWTH_STAGE.MYCELIUM,
    });

    // When
    handleFieldClick({ fieldID });

    // Then
    expect(spyOnEmit).not.toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG.MODULE_ID.GAME_LOGIC,
        e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
      }),
    );
  });

  it('버섯이 성숙 단계라면 수확 이벤트를 발생시킨다', () => {
    // Given
    spyOnGetField.mockReturnValue({
      fieldID,
      mushroomID: mushroom.id,
    });
    spyOnGetMushroom.mockReturnValue({
      ...mushroom,
      growthStage: CONFIG.GROWTH_STAGE.MATURE,
    });

    // When
    handleFieldClick({ fieldID });

    // Then
    expect(spyOnEmit).toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG.MODULE_ID.GAME_LOGIC,
        e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
      }),
    );
  });
});

describe('growthCheck', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('시간이 지나 버섯이 성장해야 할 때, 성장 이벤트를 발생시킨다', () => {
    // Given
    const fieldID = 'field-1';
    const mushroomToGrow = new Mushroom({
      fieldID,
      mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
    }); // plantedAt: Date.now()

    spyOnGetMushroomList.mockReturnValue([mushroomToGrow]);
    vi.advanceTimersByTime(mushroomToGrow.growthTime.myceliumToFruiting + 1);

    // When
    checkMushroomGrowth();

    // Then
    expect(spyOnEmit).toHaveBeenCalledWith(
      expect.objectContaining({
        e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
        data: {
          mushroomID: mushroomToGrow.id,
          nextGrowthStage: CONFIG.GROWTH_STAGE.FRUITING,
        },
      }),
    );
  });
});

it('growTo: 버섯 성장 이벤트를 발생시킨다', () => {
  // Given
  const mushroomID = 'field-1_redcap';
  const nextGrowthStage = CONFIG.GROWTH_STAGE.FRUITING;

  // When
  growTo({ mushroomID, nextGrowthStage });

  // Then
  expect(spyOnEmit).toHaveBeenCalledWith({
    from: CONFIG.MODULE_ID.GAME_LOGIC,
    e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
    data: {
      mushroomID,
      nextGrowthStage,
    },
  });
});

it('plantNewMushroom: 새로운 버섯을 심는 이벤트를 발생시킨다', () => {
  // Given
  const fieldID = 'field-1';

  // When
  plantNewMushroom({ fieldID });

  // Then
  expect(spyOnEmit).toHaveBeenCalledWith({
    from: CONFIG.MODULE_ID.GAME_LOGIC,
    e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
    data: expect.objectContaining({
      fieldID,
    }),
  });
});

it('harvestMushroom: 버섯을 수확하는 이벤트를 발생시킨다', () => {
  // Given
  const fieldID = 'field-1';
  const mushroomID = 'mushroom-1';

  // When
  harvestMushroom({ fieldID, mushroomID });

  // Then
  expect(spyOnEmit).toHaveBeenCalledWith({
    from: CONFIG.MODULE_ID.GAME_LOGIC,
    e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
    data: {
      fieldID,
      mushroomID,
    },
  });
});

describe('getRandomMushroomType', () => {
  const TEST_MUSHROOM_CONFIG = {
    'TEST-1': { type: 'TEST-1', rarity: 10 },
    'TEST-2': { type: 'TEST-2', rarity: 8 },
    'TEST-3': { type: 'TEST-3', rarity: 5 }, // 총합 23
  };

  // 10/23 = 0.43, 18/23 = 0.78
  it.each`
    rngReturnValue | expected
    ${0}           | ${'TEST-1'}
    ${0.43}        | ${'TEST-1'}
    ${0.44}        | ${'TEST-2'}
    ${0.78}        | ${'TEST-2'}
    ${0.79}        | ${'TEST-3'}
    ${0.999}       | ${'TEST-3'}
  `('$rngReturnValue => $expected', ({ rngReturnValue, expected }) => {
    // When
    const randomMushroomType = getRandomMushroomType({
      mushroomConfig: TEST_MUSHROOM_CONFIG,
      rng: () => rngReturnValue,
    });

    // Then
    expect(randomMushroomType).toBe(expected);
  });
});
