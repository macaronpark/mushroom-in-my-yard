import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEventBus } from './event-bus';

const EVENT_NAME = 'testEvent';
let EventBus;

beforeEach(() => {
  EventBus = createEventBus();
});

describe('on', () => {
  let callback;

  beforeEach(() => {
    // Given
    callback = () => {};
  });

  it('전달한 이벤트 이름으로 저장한다.', () => {
    // When
    EventBus.on({ from: 'test', e: EVENT_NAME, callback });

    // Then
    const events = EventBus.getEvents();
    expect(events[EVENT_NAME]).toBeDefined();
    expect(events[EVENT_NAME].length).toBe(1);
  });

  it('전달한 함수를 정확히 저장한다.', () => {
    // When
    EventBus.on({ from: 'test', e: EVENT_NAME, callback });

    // Then
    const events = EventBus.getEvents();
    expect(events[EVENT_NAME][0]).toBe(callback);
  });

  it('기존에 등록한 함수에 영향을 주지 않고 새로운 함수를 추가로 저장한다.', () => {
    // Given
    const callback1 = () => {};
    const callback2 = () => {};

    // When
    EventBus.on({ from: 'test', e: EVENT_NAME, callback: callback1 });
    EventBus.on({ from: 'test', e: EVENT_NAME, callback: callback2 });

    // Then
    const events = EventBus.getEvents();
    expect(events[EVENT_NAME][0]).toBe(callback1);
    expect(events[EVENT_NAME][1]).toBe(callback2);
    expect(events[EVENT_NAME].length).toBe(2);
  });
});

describe('emit', () => {
  it('해당 이벤트에 등록된 함수를 실행한다.', () => {
    // Given
    const mockCallback = vi.fn();

    EventBus.on({ from: 'test', e: EVENT_NAME, callback: mockCallback });

    // When
    EventBus.emit({ from: 'test', e: EVENT_NAME });

    // Then
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('등록된 함수에 데이터를 전달한다', () => {
    // Given
    const testData = { message: 'test' };
    const mockCallback = vi.fn();

    EventBus.on({ from: 'test', e: EVENT_NAME, callback: mockCallback });

    // When
    EventBus.emit({ from: 'test', e: EVENT_NAME, data: testData });

    // Then
    expect(mockCallback).toHaveBeenCalledWith(testData);
  });

  it('여러 함수가 등록되어 있으면 모두 실행한다', () => {
    // Given
    const mockCallback1 = vi.fn();
    const mockCallback2 = vi.fn();

    EventBus.on({ from: 'test', e: EVENT_NAME, callback: mockCallback1 });
    EventBus.on({ from: 'test', e: EVENT_NAME, callback: mockCallback2 });

    // When
    EventBus.emit({ from: 'test', e: EVENT_NAME });

    // Then
    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledTimes(1);
  });

  it('존재하지 않는 이벤트를 emit해도 오류가 발생하지 않는다', () => {
    // Then
    expect(() => {
      EventBus.emit({ from: 'test', e: 'nonexistentEvent' });
    }).not.toThrow();
  });

  it('콜백 함수에서 에러가 발생해도 다른 콜백 함수들은 정상 실행된다', () => {
    // Given
    const normalCallback = vi.fn();
    const errorCallback = vi.fn(() => {
      throw new Error('Test error');
    });

    EventBus.on({ from: 'test', e: EVENT_NAME, callback: errorCallback });
    EventBus.on({ from: 'test', e: EVENT_NAME, callback: normalCallback });

    // Then
    expect(() => {
      // When
      EventBus.emit({ from: 'test', e: EVENT_NAME });
    }).not.toThrow();

    expect(errorCallback).toHaveBeenCalledTimes(1);
    expect(normalCallback).toHaveBeenCalledTimes(1);
  });
});
