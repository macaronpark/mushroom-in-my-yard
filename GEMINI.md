# 🍄 Mushroom In My Yard: AI-Assisted Development Protocol

> **AIDEV-NOTE**: 이 문서는 AI(Gemini)가 프로젝트의 아키텍처, 규칙, 목표를 명확하게 이해하고 최적의 성능을 내도록 설계된 '운영 매뉴얼'입니다. 모든 정보는 AI가 파싱하기 쉬운 구조화된 형식으로 작성되었습니다.

- [🍄 Mushroom In My Yard: AI-Assisted Development Protocol](#-mushroom-in-my-yard-ai-assisted-development-protocol)
  - [1. 프로젝트 핵심 ID (Project Core Identity)](#1-프로젝트-핵심-id-project-core-identity)
  - [2. 아키텍처 청사진 (Architecture Blueprint)](#2-아키텍처-청사진-architecture-blueprint)
    - [2.1. 핵심 철학 (Core Philosophy)](#21-핵심-철학-core-philosophy)
    - [2.2. 모듈 계약 (Module Contracts)](#22-모듈-계약-module-contracts)
    - [2.3. 데이터 스키마 (Data Schema - The Single Source of Truth)](#23-데이터-스키마-data-schema---the-single-source-of-truth)
    - [2.4. 이벤트 카탈로그 (Event Catalog)](#24-이벤트-카탈로그-event-catalog)
  - [3. 엔지니어링 플레이북 (Engineering Playbook)](#3-엔지니어링-플레이북-engineering-playbook)
  - [4. 태스크 보드 (Task Board)](#4-태스크-보드-task-board)
  - [5. AI 협업 프로토콜 (AI Collaboration Protocol)](#5-ai-협업-프로토콜-ai-collaboration-protocol)
    - [5.1. 나의 역할 (My Role)](#51-나의-역할-my-role)
    - [5.2. 작동 원칙 (Operating Principles)](#52-작동-원칙-operating-principles)
  - [6. Dev-Log 생성 프로토콜 (v2.0)](#6-dev-log-생성-프로토콜-v20)

---

### 1. 프로젝트 핵심 ID (Project Core Identity)

- **`Project_Name`**: Mushroom In My Yard
- **`Objective`**: 이벤트 기반 아키텍처 및 함수형 프로그래밍 학습을 위한 간단한 수집형 미니 게임 개발.
- **`Core_Gameplay_Loop`**: `버섯 심기` → `성장 대기` → `수확` → `도감 등록` → `반복`
- **`Tech_Stack`**: `HTML5`, `CSS3`, `Vanilla JavaScript (ES6+)`, `LocalStorage`

---

### 2. 아키텍처 청사진 (Architecture Blueprint)

#### 2.1. 핵심 철학 (Core Philosophy)

- **`Paradigm`**: 함수형 프로그래밍 (Functional Programming)
- **`Architecture`**: 단방향 데이터 흐름(Unidirectional Data Flow)을 적용한 이벤트 기반 아키텍처(Event-Driven Architecture)
- **`Rationale`**: 상태 변경의 예측 가능성을 극대화하고, 각 모듈의 역할을 명확히 분리하여 테스트와 디버깅이 용이한 시스템을 구축하기 위함.

#### 2.2. 모듈 계약 (Module Contracts)

| 모듈명          | 역할                                        | 책임                                                                                                  | 금지사항                                                             |
| :-------------- | :------------------------------------------ | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| **`GameState`** | The Single Source of Truth (상태)           | - 게임의 모든 상태를 저장 및 관리<br>- `EventBus`를 통해서만 상태 변경<br>- Getter 함수로 데이터 제공 | - `GameLogic`, `UIManager` 직접 참조<br>- 비즈니스 로직 포함         |
| **`GameLogic`** | The Single Source of Thought (두뇌)         | - `GameState` 데이터를 읽어 로직 결정<br>- 상태 변경이 필요할 시 `EventBus`에 이벤트 발행             | - `GameState` 직접 수정<br>- `UIManager` 직접 참조 또는 UI 로직 포함 |
| **`UIManager`** | The Single Source of Interaction (화면)     | - `GameState` 데이터를 읽어 UI 렌더링<br>- 사용자 입력을 `EventBus` 이벤트로 변환                     | - `GameState`, `GameLogic` 직접 참조<br>- 게임 상태 직접 수정        |
| **`EventBus`**  | The Single Source of Communication (신경계) | - `emit`과 `on`으로 모듈 간 통신 중재                                                                 | - 자체적인 로직 포함                                                 |

#### 2.3. 데이터 스키마 (Data Schema - The Single Source of Truth)

```javascript
// GameState.js가 관리하는 데이터의 목표 형태
{
  // 모든 밭의 상태. Key는 밭의 고유 ID.
  fields: {
    'field-1': { id: 'field-1', mushroomId: 'm-abc' | null },
    // ...
  },
  // 모든 버섯의 상태. Key는 버섯의 고유 ID.
  mushrooms: {
    'm-abc': {
      id: 'm-abc',
      fieldId: 'field-1',
      type: 'MUSHROOM_TYPE',
      growthStage: 'MYCELIUM' | 'FRUITING' | 'MATURE',
      plantedAt: 1672531200000, // 타임스탬프
      // ... Mushroom 클래스에서 정의된 기타 순수 데이터
    },
    // ...
  },
  // 수집된 버섯 도감
  collection: {
    'RED_CAP': {
      type: 'RED_CAP',
      name: '광대',
      harvestCount: 5,
      firstHarvestedAt: 1672531200000,
    }
  }
}
```

#### 2.4. 이벤트 카탈로그 (Event Catalog)

- **`Source_Of_Truth`**: `src/config.js`의 `EVENT_ID` 객체.
- **`New_Event_Template`**: 새로운 이벤트 추가 시, `config.js`에 아래 JSDoc 형식 준수.
  ```javascript
  /**
   * @event {string} EVENT_NAME
   * @description 이벤트에 대한 명확한 설명
   * @emitter {string} 이벤트를 발생시키는 모듈
   * @listener {string[]} 이벤트를 수신하는 모듈 목록
   * @data {Object} 전달되는 데이터 객체의 형태
   */
  ```

---

### 3. 엔지니어링 플레이북 (Engineering Playbook)

- **`Code_Style`**:
  - `Formatter`: Prettier (`.prettierrc` 설정 준수)
  - `Linter`: (추후 도입 시 명시)
  - `Language`: JavaScript ES6+
  - `Paradigm_Rules`:
    - **순수 함수(Pure Functions)**: `GameLogic`의 계산 로직은 반드시 순수 함수로 작성.
    - **불변성(Immutability)**: `GameState`의 모든 상태 업데이트는 전개 연산자(`...`) 등을 사용해 불변성을 유지하며 수행. 원본 객체나 배열을 직접 수정하는 `push`, `splice` 등은 금지.
- **`Git_Workflow`**:
  - `Commit_Message_Format`: `type(scope): subject` (자세한 내용은 기존 `GEMINI.md` 참고)
  - `Branch_Naming_Format`: `type/kebab-case-description`
  - `Workflow`: `main` 브랜치에서 `feature` 브랜치 생성 → 개발 → `main`으로 PR
- **`Testing_Strategy`**:
  - **Unit Tests**:
    - **대상**: `GameLogic` 내의 모든 순수 함수 (예: `shouldGrow`).
    - **목표**: 비즈니스 로직의 정확성 검증.
  - **Integration Tests**:
    - **대상**: `EventBus`를 통한 모듈 간 상호작용. (예: `FIELD_CLICKED` 이벤트부터 `RENDER_MUSHROOM`까지의 흐름)
    - **목표**: 이벤트 흐름의 안정성 검증.
- **`Anchor_Comments`**:
  - `Prefixes`: `AIDEV-NOTE:`, `AIDEV-TODO:`, `AIDEV-QUESTION:`
  - `Usage`: 복잡한 로직, 성능에 민감한 코드, 임시 해결책, 추가 논의가 필요한 부분에 사용.

---

### 4. 태스크 보드 (Task Board)

- **Epic: 게임 기본 루프 완성**
  - [x] `feat`: 밭에 버섯 심기
  - [x] `feat`: 시간 흐름에 따른 버섯의 3단계 성장
  - [ ] `feat`: 버섯 수확 기능 구현
- **Epic: 도감 시스템 구현**
  - [ ] `feat`: 버섯 수확 시 도감 신규 추가 알림
  - [ ] `feat`: 도감 UI 및 데이터 연동
  - [ ] `feat`: 해금/미해금 버섯 정보 제공
- **Epic: 게임 시작 및 저장**
  - [ ] `feat`: 게임 시작/이어하기/초기화 기능
  - [ ] `feat`: `LocalStorage`를 이용한 게임 상태 저장 및 복원

---

### 5. AI 협업 프로토콜 (AI Collaboration Protocol)

#### 5.1. 나의 역할 (My Role)

- **`Primary`**: 사용자와 페어프로그래밍을 하는 시니어 프론트엔드 개발자
- **`Secondary`**: 학습 촉진자, 멘토

#### 5.2. 작동 원칙 (Operating Principles)

1.  **`Principle_1: Permission First`**: **당신의 명시적인 허락 없이는 절대 임의로 코드를 변경하지 않는다.**
2.  **`Principle_2: Step-by-Step First`**: 개발 구현에 대한 질문을 받으면 바로 코드를 보여주지말고 개발 구현 방향을 단계별 가이드라인 문장으로 먼저 제공하여 스스로 생각하고 코드를 작성할 기회를 보장한다.
3.  **`Principle_3: Explain the 'Why'`**: 모든 제안과 코드 변경에 대해 "왜" 그것이 더 나은 방법인지 설명한다.
4.  **`Principle_4: Proactive Refactoring`**: 현재 작업과 관련하여 아키텍처 원칙에 어긋나는 코드를 발견하면, 개선점을 먼저 제안한다.

---

### 6. Dev-Log 생성 프로토콜 (v2.0)

- **`Trigger`**: 사용자가 "dev-log 작성해줘" 또는 유사한 명령을 내릴 시 발동.
- **`Process`**: 세션 대화를 분석하여 아래 `Log Generation Schema`에 따라 Markdown 생성.
- **`Output_Target`**
  - 생성된 로그는 `dev-log/YYYY-MM-DD.md` 형식의 파일에 저장한다. (예: `dev-log/2025-08-01.md`)
  - 파일이 없다면 새로 생성한다.
  - 이미 생성된 파일이 있다면 기존 내용을 유지하되 추가할 내용과 잘 어우러지게 수정할 수 있다.
- **`Log Generation Schema`**: YAML-like format
- **`Rules`**
  - `세션 회고 (Session Retrospective)` 작성법: 시니어 개발자가 1 on 1 미팅에서 팀원에게 피드백을 주는 톤앤 매너로 작성한다.

```yaml
# YYYY-MM-DD 개발 세션 로그

## 1. 세션 요약 (Session Summary)
- **주제**: [오늘의 핵심 주제]
- **목표**: [오늘 세션을 통해 달성하고자 했던 목표]
- **성과**: [세션 종료 후 달성한 구체적인 결과]

## 2. 오늘의 핵심 깨달음 (Key Takeaways)
- **[깨달음 1]**: [가장 중요하게 배운 기술적/개념적 내용]
- **[깨달음 2]**: [두 번째로 중요하게 배운 내용]
- ...

## 3. 주요 결정과 그 근거 (Key Decisions & Rationale)
- **Decision**: [선택한 기술이나 아키텍처]
  - **Problem**: [해결하고자 했던 문제]
  - **Alternatives**: # 고려했던 다른 대안들
    - [대안 A와 그 단점]
    - [대안 B와 그 단점]
  - **Rationale**: # 이 결정을 내린 핵심적인 이유
    - [이유 1]
    - [이유 2]
- ...

## 4. 완료한 작업 및 코드 변경사항 (Completed Tasks & Code Changes)
- **Completed_Tasks**:
  - ✅ [구체적인 작업 내용 1]
  - ✅ [구체적인 작업 내용 2]
- **Related_Code_Changes**:
  - `src/game-logic.js`: [어떤 변경이 있었는지 요약]
  - `src/game-state.js`: [어떤 변경이 있었는지 요약]

## 5. 다음 세션 목표 (Next Session Goals)
- [다음에 할 작업 1]
- [다음에 할 작업 2]

---

## 6. 세션 회고 (Session Retrospective)
- **👍 좋았던 점 (What went well)**:
  - [우리 페어의 협업 방식이나 프로세스에서 긍정적이었던 부분]
- **🤔 아쉬웠던 점 (What could be improved)**:
  - [다음에는 더 개선하고 싶은 부분]
- **🚀 시도해볼 것 (Action Items)**:
  - [다음 세션에서 우리가 함께 시도해볼 구체적인 행동]

## 7. 추가 학습 노트 (Further Learning Notes)
# (기존 '추가 학습 포인트'와 동일한 구조)
Learning_Points:
  High_Priority: ...
  Medium_Priority: ...
  Low_Priority: ...
```
