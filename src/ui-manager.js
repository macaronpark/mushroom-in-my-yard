import { CONFIG } from './config';
import { EventBus } from './event-bus';
import GameState from './game-state';

export const UIManager = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Click event
    const yard = document.getElementById('game-yard');
    yard.addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (!target) return;

      const isFieldClicked = target.id.includes('field');
      if (!isFieldClicked) return;

      this.handleFieldClick({ fieldID: target.id });
    });

    // EventBus
    EventBus.on({
      from: FROM,
      e: CONFIG.EVENT_ID.UI_MANAGER.RENDER,
      callback: () => this.render(),
    });
  },

  handleFieldClick({ fieldID }) {
    EventBus.emit({
      from: FROM,
      e: CONFIG.EVENT_ID.GAME_LOGIC.FIELD_CLICKED,
      data: { fieldID },
    });
  },

  render() {
    const yardEl = document.getElementById('game-yard');

    const { fields, mushrooms } = GameState.getState();

    const newHTML = Object.values(fields)
      .map((field) => {
        const mushroom = mushrooms[field.mushroomID];

        return `
          <button id=${field.id} class="field">
            ${mushroom ? this.createMushroomHTML({ mushroom }) : ''}
          </button>
        `;
      })
      .join('');

    if (yardEl.innerHTML !== newHTML) {
      yardEl.innerHTML = newHTML;
    }
  },

  createMushroomHTML({ mushroom }) {
    const { id, name, growthStage } = mushroom;
    const { backgroundColor } = MUSHROOM_STYLES[growthStage];

    return `
      <div id=${id} class="mushroom" style="background-color: ${backgroundColor}">
        ${name + '버섯_' + growthStage} 
      </div>
    `;
  },
};

const FROM = CONFIG.MODULE_ID.UI_MANAGER;

export const MUSHROOM_STYLES = {
  [CONFIG.GROWTH_STAGE.MYCELIUM]: { backgroundColor: 'lightgray' },
  [CONFIG.GROWTH_STAGE.FRUITING]: { backgroundColor: 'yellow' },
  [CONFIG.GROWTH_STAGE.MATURE]: { backgroundColor: 'red' },
};
