import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from './event-bus';
import { CONFIG } from './config';
import { MUSHROOM_STYLES, UIManager } from './ui-manager';
import { Mushroom } from './mushroom';
import { GameState } from './game-state';

let spyOnEmit = vi.spyOn(EventBus, 'emit');
let spyOnGetMushroom = vi.spyOn(GameState, 'getMushroom');

beforeEach(() => {
  document.body.innerHTML = `
    <div id="app-container">
      <div class="game">
        <div id="game-yard" class="yard">
          <button id="field-1" class="field"></button>
          <button id="field-2" class="field"></button>
          <button id="field-3" class="field"></button>
        </div>
      </div>
    </div>
  `;
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('밭을 클릭하면 GAME_LOGIC.FIELD_CLICKED 이벤트를 발생시킨다', () => {
  const fieldID = 'field-1';
  const field = document.getElementById('field-1');
  UIManager.init();

  field.click();

  expect(spyOnEmit).toHaveBeenCalledWith(
    expect.objectContaining({
      e: CONFIG.EVENT_ID.GAME_LOGIC.FIELD_CLICKED,
      data: { fieldID },
    }),
  );
});

it('밭에 새로운 버섯을 추가한다', () => {
  const fieldID = 'field-1';
  const mushroom = new Mushroom({
    fieldID,
    mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
  });

  spyOnGetMushroom.mockReturnValue({
    fieldID,
    ...mushroom,
  });

  UIManager.plantNewMushroom({ mushroomID: mushroom.id });

  const mushroomEl = document.getElementById(mushroom.id);
  expect(mushroomEl.className).toBe('mushroom');

  const { backgroundColor } = MUSHROOM_STYLES[mushroom.growthStage];
  expect(mushroomEl.style.backgroundColor).toBe(backgroundColor);
  expect(mushroomEl.textContent).toBe(
    mushroom.name + '버섯_' + mushroom.growthStage,
  );
});

it('버섯의 변경사항을 반영해 업데이트한다', () => {
  const fieldID = 'field-1';
  const mushroom = new Mushroom({
    fieldID,
    mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
  });

  spyOnGetMushroom.mockReturnValue({
    fieldID,
    ...mushroom,
    growthStage: CONFIG.GROWTH_STAGE.FRUITING,
  });

  UIManager.plantNewMushroom({ mushroomID: mushroom.id });

  const updatedMushroom = {
    ...mushroom,
    growthStage: CONFIG.GROWTH_STAGE.FRUITING,
  };

  spyOnGetMushroom.mockReturnValue({
    fieldID,
    ...updatedMushroom,
  });

  UIManager.updateMushroom({ mushroomID: mushroom.id });

  const mushroomEl = document.getElementById(updatedMushroom.id);
  const { backgroundColor } = MUSHROOM_STYLES[updatedMushroom.growthStage];
  expect(mushroomEl.style.backgroundColor).toBe(backgroundColor);
  expect(mushroomEl.textContent).toBe(
    updatedMushroom.name + '버섯_' + updatedMushroom.growthStage,
  );
});

it('밭에서 버섯을 제거한다.', () => {
  const fieldID = 'field-1';
  const mushroomID = fieldID + '_RED-CAP';
  const fieldEl = document.getElementById(fieldID);
  const mushroomEl = document.createElement('div');
  mushroomEl.id = mushroomID;
  fieldEl.appendChild(mushroomEl);

  UIManager.harvestMushroom({ fieldID });

  expect(fieldEl.innerHTML).toBe('');
});
