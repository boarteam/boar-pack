import { ArgumentsHost, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { WebsocketsExceptionFilter } from './websockets.exception-filter';

describe('WebsocketsExceptionFilter', () => {
  let client: { send: jest.Mock; emit: jest.Mock };
  let host: ArgumentsHost;
  let filter: WebsocketsExceptionFilter;

  beforeAll(() => {
    Logger.overrideLogger([]);
  });

  beforeEach(() => {
    // emit is required by the base filter invoked via super.catch()
    client = { send: jest.fn(), emit: jest.fn() };
    host = {
      switchToWs: () => ({
        getClient: () => client,
        getData: () => ({ some: 'payload' }),
        getPattern: () => 'test-pattern',
      }),
    } as unknown as ArgumentsHost;
    filter = new WebsocketsExceptionFilter();
  });

  function sentFrame() {
    expect(client.send).toHaveBeenCalledTimes(1);
    expect(typeof client.send.mock.calls[0][0]).toBe('string');
    return JSON.parse(client.send.mock.calls[0][0]);
  }

  it('sends an error frame with details for a WsException carrying an object', () => {
    const exception = new WsException({
      message: 'bad input',
      details: { field: 'name' },
    });

    filter.catch(exception, host);

    expect(sentFrame()).toEqual({
      event: 'error',
      data: {
        message: 'bad input',
        details: { field: 'name' },
      },
    });
  });

  it('sends an error frame without details for a WsException carrying a string', () => {
    filter.catch(new WsException('plain failure'), host);

    const frame = sentFrame();
    expect(frame).toEqual({
      event: 'error',
      data: { message: 'plain failure' },
    });
    expect(frame.data).not.toHaveProperty('details');
  });

  it('sends an error frame without details for a plain Error', () => {
    filter.catch(new Error('kaboom'), host);

    const frame = sentFrame();
    expect(frame).toEqual({
      event: 'error',
      data: { message: 'kaboom' },
    });
    expect(frame.data).not.toHaveProperty('details');
  });

  it('delegates to the base filter which emits an exception event', () => {
    filter.catch(new Error('kaboom'), host);

    expect(client.emit).toHaveBeenCalledTimes(1);
    const [eventName, payload] = client.emit.mock.calls[0];
    expect(eventName).toBe('exception');
    expect(payload).toMatchObject({ status: 'error' });
  });
});
