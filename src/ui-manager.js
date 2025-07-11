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
    // 밭
    const field1 = document.getElementById('field-1');
    const field2 = document.getElementById('field-2');
    const field3 = document.getElementById('field-3');

    [field1, field2, field3].forEach((field) => {
      field.addEventListener('click', (event) => {
        this.handleFieldClick({
          fieldID: event.currentTarget.id,
          isEmpty: event.currentTarget.classList.contains('field--empty'),
        });
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
    mushroomElement.innerText = mushroomType;
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
