import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CONFIG from './config';
import GameState from './game-state';
import Mushroom from './mushroom';
import {
  createUIManager,
  render,
  createMushroomHTML,
  getImageUrl,
  getGrowthStageKo,
} from './ui-manager';
import assets from './assets';

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
        <div class="outside">
          <div id="yard" class="yard">
            <button id="field-1" class="field"></button>
            <button id="field-2" class="field"></button>
            <button id="field-3" class="field"></button>
          </div>
        </div>
      </div>
    </div>
  `;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// 단위 테스트
describe('init', () => {
  // Given
  it.each`
    selector       | expected
    ${'.sun'}      | ${assets.sun}
    ${'.cloud.c1'} | ${assets.cloud}
    ${'.cloud.c2'} | ${assets.cloud}
  `('$selector의 img src는 $expected', ({ selector, expected }) => {
    // When
    const UIManager = createUIManager();
    UIManager.init();

    // Then
    document
      .querySelectorAll(selector)
      .forEach((el) => expect(el.src).toBe(expected));
  });
});

describe('createMushroomHTML', () => {
  it.each`
    scenario                                   | expected
    ${'버섯의 id를 div의 id로 할당한다'}       | ${(mushroom) => `div id="${mushroom.id}"`}
    ${'mushroom 클래스를 가진다'}              | ${() => `class="mushroom"`}
    ${'배경은 투명하다'}                       | ${() => 'background-color: transparent'}
    ${'성숙 단계일 때 반짝임 효과를 부여한다'} | ${(mushroom) => (mushroom.growthStage === CONFIG.GROWTH_STAGE.MATURE ? `src="${assets.sparkle}"` : '')}
    ${'버섯 이름과 단계를 보여준다'}           | ${(mushroom) => `<p>${mushroom.name}버섯 - ${getGrowthStageKo({ growthStage: mushroom.growthStage })}</p>`}
  `('$scenario', ({ expected }) => {
    // Given
    const mushroom = new Mushroom({
      fieldID: 'field-1',
      mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
    });

    // When
    const htmlString = createMushroomHTML({ mushroom });

    // Then
    expect(htmlString).toContain(expected(mushroom));
  });
});

describe('getImageUrl', () => {
  // Given
  it.each`
    type                                   | growthStage                     | expected
    ${CONFIG.MUSHROOM.RED_CAP.type}        | ${CONFIG.GROWTH_STAGE.MYCELIUM} | ${assets.mycelium}
    ${CONFIG.MUSHROOM.RED_CAP.type}        | ${CONFIG.GROWTH_STAGE.FRUITING} | ${assets.redCapFruiting}
    ${CONFIG.MUSHROOM.RED_CAP.type}        | ${CONFIG.GROWTH_STAGE.MATURE}   | ${assets.redCapMature}
    ${CONFIG.MUSHROOM.JACK_O_LANTERN.type} | ${CONFIG.GROWTH_STAGE.MYCELIUM} | ${assets.mycelium}
    ${CONFIG.MUSHROOM.JACK_O_LANTERN.type} | ${CONFIG.GROWTH_STAGE.FRUITING} | ${assets.jackOLanternFruiting}
    ${CONFIG.MUSHROOM.JACK_O_LANTERN.type} | ${CONFIG.GROWTH_STAGE.MATURE}   | ${assets.jackOLanternMature}
    ${CONFIG.MUSHROOM.BIRDS_NEST.type}     | ${CONFIG.GROWTH_STAGE.MYCELIUM} | ${assets.mycelium}
    ${CONFIG.MUSHROOM.BIRDS_NEST.type}     | ${CONFIG.GROWTH_STAGE.FRUITING} | ${assets.birdsNestFruiting}
    ${CONFIG.MUSHROOM.BIRDS_NEST.type}     | ${CONFIG.GROWTH_STAGE.MATURE}   | ${assets.birdsNestMature}
  `(
    '$type, $growthStage의 이미지 url는 $expected',
    ({ type, growthStage, expected }) => {
      // When
      const imageUrl = getImageUrl({ type, growthStage, expected });

      // Then
      expect(imageUrl).toBe(expected);
    },
  );
});

describe('getGrowthStageKo', () => {
  // Given
  it.each`
    growthStage                     | expected
    ${CONFIG.GROWTH_STAGE.MYCELIUM} | ${'균사'}
    ${CONFIG.GROWTH_STAGE.FRUITING} | ${'자실체'}
    ${CONFIG.GROWTH_STAGE.MATURE}   | ${'성숙'}
  `('$growthStage의 한국어 표현은 $expected', ({ growthStage, expected }) => {
    // When
    const ko = getGrowthStageKo({ growthStage });

    // Then
    expect(ko).toBe(expected);
  });
});

describe('통합 테스트', () => {
  //  GameState 상태를 화면에 잘 그리는지 테스트
  let fieldID;
  let mushroom;

  beforeEach(() => {
    fieldID = 'field-1';
    mushroom = new Mushroom({
      fieldID,
      mushroomType: CONFIG.MUSHROOM.RED_CAP.type,
    });
  });

  it('밭에 새로운 버섯을 추가한다', () => {
    // Given
    spyOnGetState.mockReturnValue({
      fields: {
        [fieldID]: { id: fieldID, mushroomID: mushroom.id },
      },
      mushrooms: {
        [mushroom.id]: { ...mushroom },
      },
    });

    // When
    render();

    // Then
    const { Mushroom: MushroomEl } = renderEl();
    const { id } = MushroomEl({ mushroomID: mushroom.id });
    expect(id).toBe(mushroom.id);
  });

  it('버섯의 변경사항을 반영해 업데이트한다', () => {
    // Given
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

    render();

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

    // When
    render();

    // Then
    const { Mushroom: MushroomEl } = renderEl();
    const { id } = MushroomEl({ mushroomID: mushroom.id });
    expect(id).toBe(mushroom.id);
  });

  it('밭에서 버섯을 제거한다.', () => {
    // Given
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

    render();

    spyOnGetState.mockReturnValue({
      fields: {
        [fieldID]: { id: fieldID, mushroomID: null },
      },
      mushrooms: {},
    });

    // When
    render();

    // Then
    const { Field } = renderEl();
    expect(Field({ fieldID }).innerHTML.trim()).toBe('');
  });
});
