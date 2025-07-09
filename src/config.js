export const CONFIG = {
  // 해상도
  RESOLUTION: {
    WIDTH: 1280,
    HEIGHT: 720,
  },

  // 이벤트 식별자
  EVENT_ID: {
    FIELD: {
      CLICKED: 'fieldClicked',
      SET: 'setFieldState',
      UPDATED: 'fieldStateUpdated',
    },
  },

  // 로그 출처 식별자
  MODULE_ID: {
    LOGGER: '[Logger]',
    EVENT_BUS: '[EventBus]',
    GAME_LOGIC: '[GameLogic]',
    GAME_STATE: '[GameState]',
    UI_MANAGER: '[UIManager]',
  },
};
