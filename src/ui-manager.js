import CONFIG from './config';
import EventBus from './event-bus';
import GameState from './game-state';
import assets from './assets';

const UIManager = createUIManager();
export default UIManager;

function createUIManager() {
  const setImages = () => {
    const imageMap = {
      '.sun': assets.sun,
      '.cloud.c1': assets.cloud,
      '.cloud.c2': assets.cloud,
    };

    Object.entries(imageMap).forEach(([selector, src]) => {
      document.querySelectorAll(selector).forEach((el) => (el.src = src));
    });
  };

  const bindEvents = () => {
    // Click event
    const yard = document.getElementById('yard');
    yard.addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (!target) return;

      const isFieldClicked = target.id.includes('field');
      if (!isFieldClicked) return;

      handleFieldClick({ fieldID: target.id });
    });

    // EventBus
    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.UI_MANAGER.RENDER,
      callback: () => render(),
    });
  };

  const handleFieldClick = ({ fieldID }) => {
    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_LOGIC.FIELD_CLICKED,
      data: { fieldID },
    });
  };

  return {
    init() {
      setImages();
      bindEvents();
    },
  };
}

export function render() {
  const yardEl = document.getElementById('game-yard');

  const { fields, mushrooms } = GameState.getState();

  const newHTML = Object.values(fields)
    .map((field) => {
    const mushroom = mushrooms[field.mushroomID];

      return `
          <button id="${field.id}" class="field">
            ${mushroom ? createMushroomHTML({ mushroom }) : ''}
          </button>
        `;
    })
    .join('');

  if (yardEl.innerHTML !== newHTML) {
    yardEl.innerHTML = newHTML;
  }
}

export function createMushroomHTML({ mushroom }) {
  const { id, name, type, growthStage } = mushroom;
  const imgUrl = getImageUrl({ type, growthStage });

  return `
      <div id="${id}" class="mushroom" style="background-color: transparent">
        <img alt="${name}버섯" src="${imgUrl}" class="mushroom-img" />
        ${
          growthStage === CONFIG.GROWTH_STAGE.MATURE
            ? `<img alt="반짝임 효과" src="${assets.sparkle}" width="100%" class="sparkle-effect"/>`
            : ''
        }
        <p>${name}버섯 - ${getGrowthStageKo({ growthStage })}</p>
      </div>
    `;
}

export function getImageUrl({ type, growthStage }) {
  if (growthStage === CONFIG.GROWTH_STAGE.MYCELIUM) return assets.mycelium;

  const key = `${type}-${growthStage}`.toLowerCase();
  const map = {
    'red_cap-fruiting': assets.redCapFruiting,
    'red_cap-mature': assets.redCapMature,
    'jack_o_lantern-fruiting': assets.jackOLanternFruiting,
    'jack_o_lantern-mature': assets.jackOLanternMature,
    'birds_nest-fruiting': assets.birdsNestFruiting,
    'birds_nest-mature': assets.birdsNestMature,
  };

  return map[key];
}

export function getGrowthStageKo({ growthStage }) {
  const map = {
    [CONFIG.GROWTH_STAGE.MYCELIUM]: '균사',
    [CONFIG.GROWTH_STAGE.FRUITING]: '자실체',
    [CONFIG.GROWTH_STAGE.MATURE]: '성숙',
  };

  return map[growthStage];
}

const FROM = CONFIG.MODULE_ID.UI_MANAGER;
