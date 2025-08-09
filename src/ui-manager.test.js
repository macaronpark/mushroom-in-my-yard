import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CONFIG from './config';
import GameState from './game-state';
import Mushroom from './mushroom';
import UIManager, { MUSHROOM_STYLES } from './ui-manager';

let spyOnGetState;

const renderEl = () => {
  return {
    Field: ({ fieldID }) => document.getElementById(fieldID),
    Mushroom: ({ mushroomID }) => document.getElementById(mushroomID),
  };
};

beforeEach(() => {
  spyOnGetState = vi.spyOn(GameState, 'getState');

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe('통합 테스트', () => {
  // GameState 상태를 화면에 잘 그리는지 테스트

  it('밭에 새로운 버섯을 추가한다', () => {
    const fieldID = 'field-1';
    const mushroom = new Mushroom({
      fieldID,
      mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
    });

    spyOnGetState.mockReturnValue({
      fields: {
        [fieldID]: { id: fieldID, mushroomID: mushroom.id },
      },
      mushrooms: {
        [mushroom.id]: { ...mushroom },
      },
    });

    const { Mushroom: MushroomEl } = renderEl();

    UIManager.render();

    const { className, style, textContent } = MushroomEl({
      mushroomID: mushroom.id,
    });

    expect(className).toBe('mushroom');
    const { backgroundColor } = MUSHROOM_STYLES[mushroom.growthStage];
    expect(style.backgroundColor).toBe(backgroundColor);
    expect(textContent).toContain(
      mushroom.name + '버섯_' + mushroom.growthStage,
    );
  });

  it('버섯의 변경사항을 반영해 업데이트한다', () => {
    const fieldID = 'field-1';
    const mushroom = new Mushroom({
      fieldID,
      mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
    });

    spyOnGetState.mockReturnValue({
      fields: {
        [fieldID]: { id: fieldID, mushroomID: mushroom.id },
      },
      mushrooms: {
        [mushroom.id]: {
          ...mushroom,
          growthStage: CONFIG.GROWTH_STAGE.FRUITING,
        },
      },
    });

    UIManager.render();

    const updatedMushroom = {
      ...mushroom,
      growthStage: CONFIG.GROWTH_STAGE.FRUITING,
    };

    spyOnGetState.mockReturnValue({
      fields: {
        [fieldID]: { id: fieldID, mushroomID: mushroom.id },
      },
      mushrooms: {
        [mushroom.id]: { ...updatedMushroom },
      },
    });

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

    spyOnGetState.mockReturnValue({
      fields: {
        [fieldID]: { id: fieldID, mushroomID: mushroom.id },
      },
      mushrooms: {
        [mushroom.id]: {
          ...mushroom,
          growthStage: CONFIG.GROWTH_STAGE.FRUITING,
        },
      },
    });

    UIManager.render();

    spyOnGetState.mockReturnValue({
      fields: {
        [fieldID]: { id: fieldID, mushroomID: null },
      },
      mushrooms: {},
    });

    UIManager.render();

    expect(Field({ fieldID }).innerHTML.trim()).toBe('');
  });
});
