/**
 * 게임 전체에서 사용되는 설정 값을 정의하는 객체.
 * 이 객체는 읽기 전용으로 사용되어야 함.
 * @readonly
 */
export const CONFIG = {
  /**
   * 게임의 해상도 설정.
   * @property {number} WIDTH - 게임 화면의 너비 (px)
   * @property {number} HEIGHT - 게임 화면의 높이 (px)
   */
  RESOLUTION: {
    WIDTH: 1280,
    HEIGHT: 720,
  },

  /**
   * 버섯의 성장 단계를 나타내는 문자열 상수
   * @property {string} SPORE - 포자 단계
   * @property {string} SPROUT - 발아 단계
   * @property {string} MATURE - 성장 완료 단계
   */
  GROWTH_STAGES: {
    SPORE: 'spore',
    SPROUT: 'sprout',
    MATURE: 'mature',
  },

  // 버섯 정보
  MUSHROOM: {
    /**
     * @property {string} id - 버섯의 고유 식별자
     * @property {string} name - 버섯의 일반 이름
     * @property {string} scientificName - 버섯의 학명
     * @property {string} description - 버섯에 대한 설명
     * @property {number} rarity - 버섯의 희귀도 (0.0 ~ 1.0). 0에 가까울수록 흔하고 1에 가까울수록 희귀함.
     * @property {object} growthTime - 버섯의 단계별 성장 시간 (ms)
     * @property {number} growthTime.sporeToSprout - 포자에서 발아 단계까지 걸리는 시간
     * @property {number} growthTime.sproutToMature - 발아에서 성장 완료 단계까지 걸리는 시간
     */
    RED_CAP: {
      id: 'red-cap',
      name: '광대',
      scientificName: 'Amanita muscaria',
      description: ```
        광대버섯은 주름버섯목 광대버섯과의 독버섯으로, 북반구 전역의 침엽수림에서 자란다.
        갓은 선명한 붉은색이며 흰색 사마귀가 흩어져 있고, 처음에는 둥글지만 자라면서 평평해진다.
        흰색의 턱받이와 볼록한 구근형 밑동이 특징이다. 독성 성분으로는 무스카린, 이보텐산, 무시몰 등이 있으며,
        섭취 시 구토, 환각, 착란 등의 증상을 유발한다. 고대 인도경전 리그베다에 나오는 환각제 ‘소마’의 후보로
        지목되기도 하며, 인류 문화와 신화 속에서도 자주 등장한다.
      ```,
      rarity: 0,
      growthTime: {
        sporeToSprout: 6000,
        sproutToMature: 12000,
      },
    },
    JACK_O_LANTERN: {
      id: 'jack-o-lantern',
      name: '잭오랜턴',
      scientificName: 'Omphalotus olearius',
      description: ```
        잭오랜턴버섯은 주름버섯목 낙엽버섯과의 독버섯으로, 지중해 지역과 유럽 남부 등지에서
        활엽수 뿌리 근처에 군생한다. 할로윈이 있는 10월에 흔하게 관찰된다. 
        갓과 주름은 선명한 주황색~주홍색을 띠며, 밤에는 주름에서 희미한 녹색빛을 내는 생물발광 현상이 나타난다.
        갓은 5~15cm로 편평하게 퍼지고, 줄기는 중심에서 벗어나 자란다. 
        능이버섯과 혼동될 수 있으나 독성 성분인 일루딘S로 인해 섭취 시 심한 복통, 구토, 설사를 유발한다. 
      ```,
      rarity: 0,
      growthTime: {
        sporeToSprout: 6000,
        sproutToMature: 12000,
      },
    },
  },

  // 이벤트 식별자
  EVENT_ID: {
    FIELD: {
      CLICKED: 'fieldClicked',
      SET: 'setFieldState',
      UPDATED: 'fieldStateUpdated',
    },
  },

  /**
   * 로그 출처를 식별하기 위한 모듈 식별자.
   * 로그 메시지 앞에 붙여 어느 모듈에서 발생한 로그인지 쉽게 파악할 수 있도록 함.
   * @example
   * Logger.log({ from: CONFIG.MODULE_ID.GAME_LOGIC, msg: 'Game started' });
   * // 출력: "[LOG][GameLogic] Game started"
   */
  MODULE_ID: {
    GAME_LOGIC: '[GameLogic]',
    GAME_STATE: '[GameState]',
    UI_MANAGER: '[UIManager]',
  },
};
