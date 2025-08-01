import { beforeEach, it, vi } from 'vitest';
import { GameState } from './game-state';
import { Mushroom } from './mushroom';
import { EventBus } from './event-bus';

describe('harvestMushroom', () => {
  let fieldID;
  let mushroom;
  let spyOnEventBus;

  beforeEach(() => {
    fieldID = 'field-1';
    mushroom = new Mushroom({
      fieldID,
      mushroomType: CONFIG.MUSHROOM.RED_CAP,
    });
    mushroom.growthStage = CONFIG.GROWTH_STAGE.MATURE;

    GameState.fields[fieldID].mushroomID = mushroom.id;
    GameState.mushrooms = { mushroomID: mushroom };

    spyOnEventBus = vi.spyOn(EventBus, 'emit');
  });

  it('밭의 버섯 정보를 제거한다', () => {
    // TODO: 외부에서 수정할 수 없게하되 테스트는 가능하게 변경 필요
    // 테스트용 헬퍼 함수? mushroom 속성을 밖에서 변경하지 못하게 하기?
    GameState.harvestMushroom({ fieldID, mushroomID: mushroom.id });

    expect(GameState.fields[fieldID].mushroomID).toBeNull();
  });

  it('버섯 정보를 제거한다', () => {
    // TODO: 외부에서 수정할 수 없게하되 테스트는 가능하게 변경 필요
    GameState.harvestMushroom({ fieldID, mushroomID: mushroom.id });

    expect(GameState.mushrooms[mushroom.id]).toBeNull();
  });

  it('버섯 정보 제거 후 UI 이벤트를 발생시킨다', () => {
    GameState.harvestMushroom({ fieldID, mushroomID: mushroom.id });

    expect(spyOnEventBus).toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG.MODULE_ID.GAME_LOGIC,
        e: CONFIG.EVENT_ID.RENDER_MUSHROOM,
      }),
    );
  });
});
