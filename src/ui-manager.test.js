import { beforeEach, expect, it, vi } from 'vitest';
import EventBus from './event-bus';
import GameState from './game-state';
import UIManager, { MUSHROOM_STYLES } from './ui-manager';
import { CONFIG } from './config';
import { Mushroom } from './mushroom';

const renderEl = () => {
  return {
    Field: ({ fieldID }) => document.getElementById(fieldID),
    Mushroom: ({ mushroomID }) => document.getElementById(mushroomID),
  };
};

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

it('밭을 클릭하면 GAME_LOGIC.FIELD_CLICKED 이벤트를 발생시킨다', () => {
  const spyOnEmit = vi.spyOn(EventBus, 'emit');
  const fieldID = 'field-1';
  const { Field } = renderEl();
  UIManager.init();

  Field({ fieldID }).click();

  expect(spyOnEmit).toHaveBeenCalledWith(
    expect.objectContaining({
      e: CONFIG.EVENT_ID.GAME_LOGIC.FIELD_CLICKED,
      data: { fieldID },
    }),
  );

  spyOnEmit.mockRestore();
});

it('밭에 새로운 버섯을 추가한다', () => {
  const fieldID = 'field-1';
  const mushroom = new Mushroom({
    fieldID,
    mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
  });

  GameState.fields[fieldID].mushroomID = mushroom.id;
  GameState.mushrooms[mushroom.id] = mushroom;

  const { Mushroom: MushroomEl } = renderEl();

  UIManager.render();

  const { className, style, textContent } = MushroomEl({
    mushroomID: mushroom.id,
  });

  expect(className).toBe('mushroom');
  const { backgroundColor } = MUSHROOM_STYLES[mushroom.growthStage];
  expect(style.backgroundColor).toBe(backgroundColor);
  expect(textContent).toContain(mushroom.name + '버섯_' + mushroom.growthStage);
});

it('버섯의 변경사항을 반영해 업데이트한다', () => {
  const fieldID = 'field-1';
  const mushroom = new Mushroom({
    fieldID,
    mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
  });

  GameState.fields[fieldID].mushroomID = mushroom.id;
  GameState.mushrooms[mushroom.id] = {
    ...mushroom,
    growthStage: CONFIG.GROWTH_STAGE.FRUITING,
  };

  UIManager.render();

  const updatedMushroom = {
    ...mushroom,
    growthStage: CONFIG.GROWTH_STAGE.FRUITING,
  };

  GameState.mushrooms[mushroom.id] = {
    ...updatedMushroom,
  };

  UIManager.render();

  const mushroomEl = document.getElementById(updatedMushroom.id);
  const { backgroundColor } = MUSHROOM_STYLES[updatedMushroom.growthStage];
  expect(mushroomEl.style.backgroundColor).toBe(backgroundColor);
  expect(mushroomEl.textContent).toContain(
    updatedMushroom.name + '버섯_' + updatedMushroom.growthStage,
  );
});

it('밭에서 버섯을 제거한다.', () => {
  const fieldID = 'field-1';
  const mushroom = new Mushroom({
    fieldID,
    mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
  });

  const { Field } = renderEl();

  GameState.fields[fieldID].mushroomID = mushroom.id;
  GameState.mushrooms[mushroom.id] = {
    ...mushroom,
    growthStage: CONFIG.GROWTH_STAGE.FRUITING,
  };

  UIManager.render();

  GameState.fields[fieldID].mushroomID = null;
  GameState.mushrooms = {};

  UIManager.render();

  expect(Field({ fieldID }).innerHTML.trim()).toBe('');
});
