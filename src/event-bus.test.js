import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from './event-bus.js';

beforeEach(() => {
  EventBus.events = {};
});

describe('on', () => {
  it('전달한 이벤트 이름으로 저장한다.', () => {
    const eventName = 'testEvent';
    const callback = () => {};

    EventBus.on({ from: 'test', e: eventName, callback });

    expect(EventBus.events[eventName]).toBeDefined();
    expect(EventBus.events[eventName].length).toBe(1);
    expect(EventBus.events[eventName][0]).toBe(callback);
  });

  it('전달한 함수를 정확히 저장한다.', () => {
    const eventName = 'testEvent';
    const callback = () => {};

    EventBus.on({ from: 'test', e: eventName, callback });

    expect(EventBus.events[eventName][0]).toBe(callback);
  });

  it('기존에 등록한 함수에 영향을 주지 않고 새로운 함수를 추가로 저장한다.', () => {
    const eventName = 'testEvent';
    const callback1 = () => {};
    const callback2 = () => {};

    EventBus.on({ from: 'test', e: eventName, callback: callback1 });
    EventBus.on({ from: 'test', e: eventName, callback: callback2 });

    expect(EventBus.events[eventName].length).toBe(2);
    expect(EventBus.events[eventName][0]).toBe(callback1);
    expect(EventBus.events[eventName][1]).toBe(callback2);
  });
});

describe('emit', () => {
  it('해당 이벤트에 등록된 함수를 실행한다.', () => {
    const eventName = 'testEvent';
    const mockCallback = vi.fn();

    EventBus.on({ from: 'test', e: eventName, callback: mockCallback });
    EventBus.emit({ from: 'test', e: eventName });

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('등록된 함수에 데이터를 전달한다', () => {
    const eventName = 'testEvent';
    const testData = { message: 'test' };
    const mockCallback = vi.fn();

    EventBus.on({ from: 'test', e: eventName, callback: mockCallback });
    EventBus.emit({ from: 'test', e: eventName, data: testData });

    expect(mockCallback).toHaveBeenCalledWith(testData);
  });

  it('여러 함수가 등록되어 있으면 모두 실행한다', () => {
    const eventName = 'testEvent';
    const mockCallback1 = vi.fn();
    const mockCallback2 = vi.fn();

    EventBus.on({ from: 'test', e: eventName, callback: mockCallback1 });
    EventBus.on({ from: 'test', e: eventName, callback: mockCallback2 });
    EventBus.emit({ from: 'test', e: eventName });

    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledTimes(1);
  });

  it('존재하지 않는 이벤트를 emit해도 오류가 발생하지 않는다', () => {
    expect(() => {
      EventBus.emit({ from: 'test', e: 'nonexistentEvent' });
    }).not.toThrow();
  });

  it('콜백 함수에서 에러가 발생해도 다른 콜백 함수들은 정상 실행된다', () => {
    const eventName = 'testEvent';
    const errorCallback = vi.fn(() => {
      throw new Error('Test error');
    });
    const normalCallback = vi.fn();

    EventBus.on({ from: 'test', e: eventName, callback: errorCallback });
    EventBus.on({ from: 'test', e: eventName, callback: normalCallback });

    expect(() => {
      EventBus.emit({ from: 'test', e: eventName });
    }).not.toThrow();

    expect(errorCallback).toHaveBeenCalledTimes(1);
    expect(normalCallback).toHaveBeenCalledTimes(1);
  });
});
