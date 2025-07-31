import { CONFIG } from './config';
import { EventBus } from './event-bus';
import { GameState } from './game-state';
import { Logger } from './logger';

export const UIManager = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const yard = document.getElementById('game-yard');
    yard.addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (!target) return;

      const isFieldClicked = target.id.includes('field');
      if (!isFieldClicked) return;

      const isFieldEmpty = target.classList.contains('field--empty');
      if (!isFieldEmpty) return;

      this.handleFieldClick({ fieldID: target.id });
    });

    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.RENDER_MUSHROOM,
      callback: ({ mushroomID }) => this.renderMushroom({ mushroomID }),
    });
  },

  handleFieldClick({ fieldID }) {
    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.FIELD_CLICKED,
      data: { fieldID },
    });
  },

  renderMushroom({ mushroomID }) {
    const isExist = document.getElementById(mushroomID);

    if (!isExist) {
      this.plantMushroom({ mushroomID });
    }

    this.updateMushroom({ mushroomID });
  },

  plantMushroom({ mushroomID }) {
    const { fieldID, id } = GameState.getMushroom({ mushroomID });
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

  updateMushroom({ mushroomID }) {
    const { id, name, growthStage } = GameState.getMushroom({ mushroomID });
    const mushroomEl = document.getElementById(id);

    if (!mushroomEl) {
      Logger.error({
        from: FROM,
        msg: `❌ updateMushroom: ${id} not found`,
      });
      return;
    }

    const { backgroundColor } = MUSHROOM_STYLES[growthStage];
    mushroomEl.style.backgroundColor = backgroundColor;
    mushroomEl.textContent = name + '버섯_' + growthStage;
  },
};

const FROM = CONFIG.MODULE_ID.UI_MANAGER;

const MUSHROOM_STYLES = {
  [CONFIG.GROWTH_STAGE.MYCELIUM]: { backgroundColor: 'lightGray' },
  [CONFIG.GROWTH_STAGE.FRUITING]: { backgroundColor: 'yellow' },
  [CONFIG.GROWTH_STAGE.MATURE]: { backgroundColor: 'red' },
};
