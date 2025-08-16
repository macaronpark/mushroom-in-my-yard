### 저 함수형 프로그래밍 중인데 `function` 키워드 사용해도 될까요?

- 문제
  - 파일을 열었을 때 가장 중요한 `GameLogic` 선언이 바로 보이지 않음
  - 결론(무엇이 공개되는가)보다 세부 구현(`createGameLogic()`)이 먼저 보여서 **가독성 저하**

- 원인
  - `createGameLogic`을 화살표 함수(함수 표현식)로 작성해 상단 배치/호이스팅이 불가

- 고민한 지점/대안
  - 함수 선언식으로 전환해 호이스팅 활용해볼까?
  - JS 함수형 프로그래밍 기조 프로젝트들에서 arrow function을 많이 사용하던데 function 키워드를 사용해도 될까?

- 최종 선택
  - `function` 키워드 사용

    ```javascript
    const GameLogic = createGameLogic();
    export default GameLogic;

    function createGameLogic() { ... };
    ```

  - 이유
    - 가독성: 파일 상단에서 GameLogic 바로 확인 가능
    - 호이스팅: 선언 이전 참조 가능
    - 디버깅: 스택 추적 용이
  - 관련 커밋: [refactor: GameLogic 함수를 분리해 공개 API 명시, 테스트 용이성 향상](https://github.com/macaronpark/mushroom-in-my-yard/pull/9/commits/19a84fbf30f923bad6def0a604d62ff0c55f41c6)

- 배운 점
  - FP의 본질은 **무엇을/어떻게 계산하느냐**(순수성, 불변성)이지 **`function`/`=>` 문체가 아님**
  - 선언 방식은 **가독성·디버깅·초기화 순서**를 위한 도구
    - 콜백/작은 클로저: 화살표 함수(간결, this 바인딩 없음)
    - 공개 API/팩토리/핵심 로직: 함수 선언식(호이스팅, 명명, 스택 추적 용이)
