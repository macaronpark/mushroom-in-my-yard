import { CONFIG } from './config';
import { EventBus } from './event-bus';
import { Logger } from './logger';

export const UIManager = {
  init() {
    this.bindEvents();

    Logger.log({
      from: FROM,
      msg: '🐣 init',
    });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.FIELD.UPDATED,
      callback: (data) => this.renderField(data),
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
    const data = {
      fieldID,
      isEmpty,
    };

    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.FIELD.CLICKED,
      data,
    });
  },

  renderField(data) {
    const { fieldID, mushroomType, plantedTime } = data;
    const targetField = document.getElementById(fieldID);

    if (!targetField) {
      Logger.error({
        from: FROM,
        msg: `❌ renderField: field not found for ${fieldID}`,
        data,
      });
      return;
    }

    if (mushroomType) {
      this.plantMushroom({
        field: targetField,
        mushroomType,
        plantedTime,
      });
    }

    Logger.log({
      from: FROM,
      msg: `✅ renderField`,
      data,
    });
  },

  plantMushroom({ field, mushroomType, plantedTime }) {
    field.classList.remove('field--empty');
    field.classList.add('field--planted');

    const existingMushroom = field.querySelector('.mushroom');
    if (existingMushroom) existingMushroom.remove();

    const mushroomElement = document.createElement('div');
    mushroomElement.textContent = mushroomType;
    mushroomElement.className = `mushroom`;

    field.appendChild(mushroomElement);

    Logger.log({
      from: FROM,
      msg: `🌱 Planted`,
      data: { fieldID: field.id, mushroomType, plantedTime },
    });
  },
};

const FROM = CONFIG.MODULE_ID.UI_MANAGER;
