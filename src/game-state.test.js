import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EventBus from './event-bus';
import Mushroom from './mushroom';
import { CONFIG } from './config';
import { createGameState } from './game-state';

let GameState;
let fieldID;
let mushroom;

beforeEach(() => {
  // Given
  fieldID = 'field-1';
  mushroom = new Mushroom({
    fieldID,
    mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
  });

  GameState = createGameState();
  GameState.init();
});

describe('addNewMushroom', () => {
  beforeEach(() => {
    // When
    EventBus.emit({
      from: 'TEST',
      e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
      data: { ...mushroom },
    });
  });

  it('밭 정보에 신규 버섯 정보를 추가한다', () => {
    // Then
    const { fields } = GameState.getState();
    expect(fields[fieldID].mushroomID).toBe(mushroom.id);
  });

  it('버섯 정보에 신규 버섯 정보를 추가한다', () => {
    // Then
    const { mushrooms } = GameState.getState();
    expect(mushrooms[mushroom.id]).toEqual(mushroom);
  });
});

describe('updateMushroomGrowthStage', () => {
  it('버섯 성장 단계를 업데이트한다', () => {
    // Given
    const GROWTH_STAGE = CONFIG.GROWTH_STAGE.FRUITING;

    // When
    EventBus.emit({
      from: 'TEST',
      e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
      data: {
        mushroomID: mushroom.id,
        nextGrowthStage: GROWTH_STAGE,
      },
    });

    // Then
    const { mushrooms } = GameState.getState();
    expect(mushrooms[mushroom.id].growthStage).toBe(GROWTH_STAGE);
  });
});

describe('deleteMushroom', () => {
  let spyOnEmit;

  beforeEach(() => {
    // Given
    spyOnEmit = vi.spyOn(EventBus, 'emit');

    EventBus.emit({
      from: 'TEST',
      e: CONFIG.EVENT_ID.GAME_STATE.SET_NEW_MUSHROOM,
      data: { ...mushroom },
    });

    const GROWTH_STAGE = CONFIG.GROWTH_STAGE.MATURE;

    EventBus.emit({
      from: 'TEST',
      e: CONFIG.EVENT_ID.GAME_STATE.UPDATE_MUSHROOM_GROWTH_STAGE,
      data: {
        mushroomID: mushroom.id,
        nextGrowthStage: GROWTH_STAGE,
      },
    });

    // When
    EventBus.emit({
      from: 'TEST',
      e: CONFIG.EVENT_ID.GAME_STATE.HARVEST_MUSHROOM,
      data: { fieldID, mushroomID: mushroom.id },
    });
  });

  afterEach(() => {
    spyOnEmit.mockRestore();
  });

  it('밭의 버섯 정보를 제거한다', () => {
    // Then
    const { fields } = GameState.getState();
    expect(fields[fieldID].mushroomID).toBeNull();
  });

  it('버섯 정보를 제거한다', () => {
    // Then
    const { mushrooms } = GameState.getState();
    expect(mushrooms[mushroom.id]).toBeUndefined();
  });

  it.todo('도감 해금 여부를 확인하고 필요 시 업데이트한다');

  it('버섯 정보 제거 후 UI 이벤트를 발생시킨다', () => {
    // Then
    expect(spyOnEmit).toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG.MODULE_ID.GAME_STATE,
        e: CONFIG.EVENT_ID.UI_MANAGER.RENDER,
      }),
    );
  });
});
