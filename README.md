# mushroom-in-my-yard

이벤트 기반 아키텍처와 함수형 프로그래밍, 그리고 HTML/CSS/JavaScript 학습을 위한 간단한 버섯 수집 미니 게임입니다.

> [!NOTE]
> 이 프로젝트는 AI 페어 프로그래밍을 통해 개발되었으며, 각 세션 기록은 [/dev-log](/dev-log/README.md)에 기록합니다.

## 주요 기능

- **버섯 심기**: 비어있는 밭에 새로운 버섯을 심습니다.
- **버섯 성장**: 시간이 흐름에 따라 버섯이 3단계(균사 → 자실체 → 성숙)로 성장합니다.
- **버섯 수확**: 완전히 성장한 버섯을 수확하여 도감에 등록합니다. `🚧 개발 중`
- **버섯 도감**: 수확한 버섯의 정보를 확인하고 수집 현황을 볼 수 있습니다. `🚧 개발 중`
- **데이터 저장**: 게임 진행 상황이 로컬 스토리지에 자동으로 저장됩니다. `🚧 개발 중`

## 시작하기

```bash
git clone https://github.com/your-username/mushroom-in-my-yard.git
cd mushroom-in-my-yard

npm install

npm run dev
```

## 기술 스택

- Core: `HTML5`, `CSS3`, `Vanilla JavaScript`
- Build: `Vite`
- Storage: `LocalStorage`
- Paradigm & Architecture: 함수형 프로그래밍, 이벤트 기반 아키텍처

## 파일 구조

- `📂 /mushroom-in-my-yard`
  - `📂 .github` - Github Actions workflows
  - `📂 dev-log` - AI 페어 프로그래밍 세션 기록
  - `📂 src`
    - `📄 config.js`
    - `📄 event-bus.js`
    - `📄 game-logic.js`
    - `📄 game-state.js`
    - `📄 logger.js`
    - `📄 main.js` - 진입점
    - `📄 mushroom.js`
    - `📄 style.css`
    - `📄 ui-manager.js`
  - `📄 GEMINI.md` - AI 장기 기억을 위한 맥락 기록
  - `📄 index.html`

## 아키텍처

단방향 데이터 흐름(Unidirectional Data Flow)을 기반으로 한 이벤트 기반 아키텍처(Event-Driven
Architecture)

```mermaid
graph TD
  subgraph "이벤트 흐름 (쓰기 & 알림)"
      UIManager -- "(1) 사용자 입력" --> EventBus
      EventBus -- "(2) 로직 실행 요청" --> GameLogic
      GameLogic -- "(3) 상태 변경 이벤트" --> EventBus
      EventBus -- "(4) 상태 업데이트 요청" --> GameState
      GameState -- "(5) 상태 변경 완료 알림" --> EventBus
      EventBus -- "(6) 화면 갱신 요청" --> UIManager
  end

  subgraph "데이터 직접 읽기 (조회)"
      direction LR
      GameState_R[GameState] -.-> GameLogic_R[GameLogic]
      GameState_R[GameState] -.-> UIManager_R[UIManager]
  end

  %% 스타일링
  style GameState fill:#c154c1,stroke:#333,stroke-width:2px
  style GameState_R fill:#c154c1,stroke:#333,stroke-width:2px
```

- 핵심 설계 원칙: **데이터는 한 방향으로만 흐른다.**
  - 이 원칙을 지키기 위해 각 모듈은 아래와 같이 단 하나의 역할만 책임진다.
- 모듈별 역할
  - GameState - 게임의 모든 상태를 저장하고 관리
  - GameLogic - 게임의 모든 규칙과 로직을 결정하고 실행
  - UIManager - 사용자에게 보여지는 모든 UI를 그리고, 사용자로부터 입력을 받음
  - EventBus - 모든 모듈 간의 통신을 중재하는 유일한 창구
