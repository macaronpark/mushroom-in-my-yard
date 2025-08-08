import { CONFIG } from './config';
import { EventBus } from './event-bus';
import { GameState } from './game-state';
import { Logger } from './logger';

export const UIManager = {
  init() {
    this.bindClickEvents();
    this.bindEventBus();
  },

  bindClickEvents() {
    const yard = document.getElementById('game-yard');
    yard.addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (!target) return;

      const isFieldClicked = target.id.includes('field');
      if (!isFieldClicked) return;

      this.handleFieldClick({ fieldID: target.id });
    });
  },

  bindEventBus() {
    const eventList = [
      {
        e: CONFIG.EVENT_ID.UI_MANAGER.PLANT_NEW_MUSHROOM,
        callback: ({ mushroomID }) => this.plantNewMushroom({ mushroomID }),
      },
      {
        e: CONFIG.EVENT_ID.UI_MANAGER.UPDATE_MUSHROOM,
        callback: ({ mushroomID }) => this.updateMushroom({ mushroomID }),
      },
      {
        e: CONFIG.EVENT_ID.UI_MANAGER.HARVEST_MUSHROOM,
        callback: ({ fieldID }) => this.harvestMushroom({ fieldID }),
      },
    ];

    eventList.forEach(({ e, callback }) =>
      EventBus.on({ from: FROM, e, callback }),
    );
  },

  handleFieldClick({ fieldID }) {
    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_LOGIC.FIELD_CLICKED,
      data: { fieldID },
    });
  },

  plantNewMushroom({ mushroomID }) {
    const { fieldID, id, name, growthStage } = GameState.getMushroom({
      mushroomID,
    });
    const targetField = document.getElementById(fieldID);

    if (!targetField) {
      Logger.error({
        from: FROM,
        msg: `❌ plantMushroom: ${fieldID} not found`,
      });
      return;
    }

    targetField.innerHTML = '';

    const mushroomEl = document.createElement('div');
    mushroomEl.id = id;
    mushroomEl.className = `mushroom`;

    const { backgroundColor } = MUSHROOM_STYLES[growthStage];
    mushroomEl.style.backgroundColor = backgroundColor;
    mushroomEl.textContent = name + '버섯_' + growthStage;

    targetField.appendChild(mushroomEl);
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

  harvestMushroom({ fieldID }) {
    const targetField = document.getElementById(fieldID);

    if (!targetField) {
      Logger.error({
        from: FROM,
        msg: `❌ harvestMushroom: ${fieldID} not found`,
      });
      return;
    }

    targetField.innerHTML = '';
  },
};

const FROM = CONFIG.MODULE_ID.UI_MANAGER;

export const MUSHROOM_STYLES = {
  [CONFIG.GROWTH_STAGE.MYCELIUM]: { backgroundColor: 'lightgray' },
  [CONFIG.GROWTH_STAGE.FRUITING]: { backgroundColor: 'yellow' },
  [CONFIG.GROWTH_STAGE.MATURE]: { backgroundColor: 'red' },
};
