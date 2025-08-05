import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameState } from './game-state';
import { Mushroom } from './mushroom';
import { EventBus } from './event-bus';
import { CONFIG } from './config';

describe('deleteMushroom', () => {
  let fieldID;
  let mushroom;
  let spyOnEventBus;

  beforeEach(() => {
    fieldID = 'field-1';
    mushroom = new Mushroom({
      fieldID,
      mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
    });

    GameState.fields[fieldID].mushroomID = mushroom.id;
    GameState.mushrooms = {
      [mushroom.id]: {
        ...mushroom,
        growthStage: CONFIG.GROWTH_STAGE.MATURE,
      },
    };

    spyOnEventBus = vi.spyOn(EventBus, 'emit');
  });

  it('밭의 버섯 정보를 제거한다', () => {
    // TODO: 외부에서 수정할 수 없게하되 테스트는 가능하게 변경 필요
    // 테스트용 헬퍼 함수? mushroom 속성을 밖에서 변경하지 못하게 하기?
    GameState.deleteMushroom({ fieldID, mushroomID: mushroom.id });

    expect(GameState.fields[fieldID].mushroomID).toBeNull();
  });

  it('버섯 정보를 제거한다', () => {
    // TODO: 외부에서 수정할 수 없게하되 테스트는 가능하게 변경 필요
    GameState.deleteMushroom({ fieldID, mushroomID: mushroom.id });

    expect(GameState.mushrooms[mushroom.id]).toBeNull();
  });

  it.todo('도감 해금 여부를 확인하고 필요 시 업데이트한다');

  it('버섯 정보 제거 후 UI 이벤트를 발생시킨다', () => {
    GameState.deleteMushroom({ fieldID, mushroomID: mushroom.id });

    expect(spyOnEventBus).toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG.MODULE_ID.GAME_STATE,
        e: CONFIG.EVENT_ID.UI_MANAGER.HARVEST_MUSHROOM,
      }),
    );
  });
});
