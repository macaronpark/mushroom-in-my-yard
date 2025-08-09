import { CONFIG } from './config.js';
import GameLogic from './game-logic.js';
import GameState from './game-state.js';
import { UIManager } from './ui-manager.js';

document.addEventListener('DOMContentLoaded', () => {
  scaleContainer();

  GameState.init();
  GameLogic.init();
  UIManager.init();
});

window.addEventListener('resize', () => {
  scaleContainer();
});

function scaleContainer() {
  const targetWidth = CONFIG.RESOLUTION.WIDTH;
  const targetHeight = CONFIG.RESOLUTION.HEIGHT;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // 16:9 비율을 유지하면서 최대 스케일 계산
  const scaleX = screenWidth / targetWidth;
  const scaleY = screenHeight / targetHeight;
  const scale = Math.min(scaleX, scaleY);

  const container = document.getElementById('app-container');
  container.style.transform = `scale(${scale})`;
}
