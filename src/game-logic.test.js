import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CONFIG from './config';
import EventBus from './event-bus';
import {
  getNextGrowthStage,
  getRandomMushroomType,
  handleFieldClick,
} from './game-logic';
import GameState from './game-state';
import Mushroom from './mushroom';

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

describe('버섯의 라이프 사이클', () => {
  // Given
  const fieldID = 'field-1';
  const mushroom = new Mushroom({
    fieldID,
    mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
  });

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

  describe('버섯 심기', () => {
    it('빈 밭을 클릭하면 버섯 심기 이벤트를 발생시킨다', () => {
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

    it('버섯 심기 이벤트에 필요한 정보를 전달한다', () => {
      // Given
      spyOnGetField.mockReturnValue({ fieldID, mushroomID: null });

      // When
      handleFieldClick({ fieldID });

      // Then
      expect(spyOnEmit).toHaveBeenCalledWith(
        expect.objectContaining({
          from: CONFIG.MODULE_ID.GAME_LOGIC,
          e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
          data: expect.objectContaining({
            fieldID,
            id: expect.any(String),
            type: expect.any(String),
            name: expect.any(String),
            rarity: expect.any(Number),
            plantedAt: expect.any(Number),
            growthTime: {
              myceliumToFruiting: expect.any(Number),
              fruitingToMature: expect.any(Number),
            },
            growthStage: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('버섯 성장', () => {
    it('성장 중인 밭은 클릭해도 아무런 이벤트가 발생하지 않는다', () => {
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
      expect(spyOnEmit).not.toHaveBeenCalled();
    });

    describe('지정된 시간이 흐른 후, ', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it.each`
        scenario                                                    | nextGrowthStage                 | timeToForward
        ${'지정된 시간이 흐른 후, 균사에서 자실체 단계로 성장한다'} | ${CONFIG.GROWTH_STAGE.FRUITING} | ${({ growthTime }) => growthTime.myceliumToFruiting}
        ${'지정된 시간이 흐른 후, 자실체에서 성숙 단계로 성장한다'} | ${CONFIG.GROWTH_STAGE.MATURE}   | ${({ growthTime }) => growthTime.myceliumToFruiting + growthTime.fruitingToMature}
      `('$scenario', ({ nextGrowthStage, timeToForward }) => {
        // Given
        spyOnGetField.mockReturnValue({ fieldID, mushroomID: null });

        handleFieldClick({ fieldID });

        const plantEvent = spyOnEmit.mock.calls.find(
          (call) => call[0].e === CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
        );
        const plantedMushroom = plantEvent[0].data;

        // When
        vi.advanceTimersByTime(
          timeToForward({ growthTime: plantedMushroom.growthTime }),
        );

        // Then
        const lastCallArgs = spyOnEmit.mock.lastCall[0];
        expect(lastCallArgs).toEqual({
          from: CONFIG.MODULE_ID.GAME_LOGIC,
          e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
          data: {
            mushroomID: plantedMushroom.id,
            nextGrowthStage,
          },
        });
      });
    });
  });

  describe('버섯 수확', () => {
    it('성장을 완료한 밭을 클릭하면 버섯 수확 이벤트를 발생시킨다', () => {
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

    it('버섯 수확 이벤트에 필요한 정보를 전달한다', () => {
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
      expect(spyOnEmit).toHaveBeenCalledWith({
        from: CONFIG.MODULE_ID.GAME_LOGIC,
        e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
        data: {
          fieldID,
          mushroomID: mushroom.id,
        },
      });
    });
  });
});
