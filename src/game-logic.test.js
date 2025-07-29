import { expect, it, vi } from 'vitest';
import { GameLogic } from './game-logic';
import { EventBus } from './event-bus';
import { CONFIG } from './config';

it('init: 빈 밭이 클릭되면 버섯을 심도록 FIELD_CLICKED 이벤트에 plant 핸들러를 등록한다.', () => {
  const spyOnEventBus = vi.spyOn(EventBus, 'on');

  GameLogic.init();

  expect(spyOnEventBus).toHaveBeenCalledWith({
    from: CONFIG.MODULE_ID.GAME_LOGIC,
    e: CONFIG.EVENT_ID.FIELD_CLICKED,
    callback: GameLogic.plantNewMushroom,
  });

  spyOnEventBus.mockRestore();
});
