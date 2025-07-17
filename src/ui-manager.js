import { CONFIG } from './config';
import { EventBus } from './event-bus';
import { Logger } from './logger';

export const UIManager = {
  init() {
    this.bindEvents();

    Logger.log({ from: FROM, msg: '🐣 init' });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.RENDER_MUSHROOM,
      callback: ({ mushroom }) => this.renderMushroom({ mushroom }),
    });
  },

  bindEvents() {
    const yard = document.getElementById('game-yard');

    yard.addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (!target) return;

      const isFieldClicked = target.id.includes('field');
      if (!isFieldClicked) return;

      this.handleFieldClick({
        fieldID: target.id,
        isEmpty: target.classList.contains('field--empty'),
      });
    });
  },

  handleFieldClick({ fieldID, isEmpty }) {
    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.FIELD_CLICKED,
      data: { fieldID, isEmpty },
    });
  },

  renderMushroom({ mushroom }) {
    const isExist = document.getElementById(mushroom.id);

    if (!isExist) {
      this.plantMushroom({ mushroom });
    }

    this.updateMushroom({ mushroom });
  },

  plantMushroom({ mushroom }) {
    const { fieldID, id } = mushroom;
    const targetField = document.getElementById(fieldID);

    if (!targetField) {
      Logger.error({
        from: FROM,
        msg: `❌ plantMushroom: ${fieldID} not found`,
      });
      return;
    }

    targetField.classList.remove('field--empty');
    targetField.classList.add('field--planted');
    targetField.innerHTML = '';

    const mushroomElement = document.createElement('div');
    mushroomElement.id = id;
    mushroomElement.className = `mushroom`;

    targetField.appendChild(mushroomElement);

    Logger.log({ from: FROM, msg: `🌱 plantMushroom: ${id}` });
  },

  updateMushroom({ mushroom }) {
    const mushroomEl = document.getElementById(mushroom.id);

    if (!mushroomEl) {
      Logger.error({
        from: FROM,
        msg: `❌ updateMushroomGrowthStage: ${mushroom.id} not found`,
      });
      return;
    }

    mushroomEl.style.backgroundColor =
      mushroom.growthStage === CONFIG.GROWTH_STAGE.MYCELIUM
        ? 'lightGray'
        : mushroom.growthStage === CONFIG.GROWTH_STAGE.FRUITING
          ? 'yellow'
          : 'red';

    mushroomEl.textContent =
      mushroom.name +
      '버섯_' +
      (mushroom.growthStage === CONFIG.GROWTH_STAGE.MYCELIUM
        ? 'MYCELIUM'
        : mushroom.growthStage === CONFIG.GROWTH_STAGE.FRUITING
          ? 'FRUITING'
          : 'MATURE');
  },
};

const FROM = CONFIG.MODULE_ID.UI_MANAGER;
