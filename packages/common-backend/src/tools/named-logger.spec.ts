import { NamedLogger } from './named-logger';

// ConsoleLogger writes straight to process.stdout/stderr (forceConsole is off
// by default), possibly with ANSI colors — capture and strip before asserting.
const ANSI = /\u001b\[[0-9;]*m/g;

describe('Tools.NamedLogger', () => {
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    stderrSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  function writtenLines(spy: jest.SpyInstance): string[] {
    return spy.mock.calls.map((call) => String(call[0]).replace(ANSI, ''));
  }

  it('prefixes stdout log lines with the given name and the pid', () => {
    const logger = new NamedLogger('MyWorker');

    logger.log('hello world');

    const lines = writtenLines(stdoutSpy);
    expect(lines).toHaveLength(1);
    expect(lines[0].startsWith(`[MyWorker] ${process.pid}  - `)).toBe(true);
    expect(lines[0]).toContain('LOG');
    expect(lines[0]).toContain('hello world');
  });

  it('keeps the context segment of the base ConsoleLogger format', () => {
    const logger = new NamedLogger('MyWorker');

    logger.log('payload', 'SomeContext');

    const [line] = writtenLines(stdoutSpy);
    expect(line).toContain('[SomeContext] payload');
    expect(line.startsWith(`[MyWorker] ${process.pid}  - `)).toBe(true);
  });

  it('falls back to the "Nest" prefix when no name is given', () => {
    const logger = new NamedLogger();

    logger.log('anonymous');

    const [line] = writtenLines(stdoutSpy);
    expect(line.startsWith(`[Nest] ${process.pid}  - `)).toBe(true);
  });

  it('treats an empty-string name as missing and uses "Nest"', () => {
    const logger = new NamedLogger('');

    logger.log('empty');

    const [line] = writtenLines(stdoutSpy);
    expect(line.startsWith(`[Nest] ${process.pid}  - `)).toBe(true);
  });

  it('prefixes error output on stderr as well', () => {
    const logger = new NamedLogger('ErrProc');

    logger.error('boom');

    expect(stdoutSpy).not.toHaveBeenCalled();
    const lines = writtenLines(stderrSpy);
    expect(lines).toHaveLength(1);
    expect(lines[0].startsWith(`[ErrProc] ${process.pid}  - `)).toBe(true);
    expect(lines[0]).toContain('ERROR');
    expect(lines[0]).toContain('boom');
  });

  it('formatPid renders the name around any pid value', () => {
    const logger = new NamedLogger('Api');
    expect(logger.formatPid(123)).toBe('[Api] 123  - ');
  });
});
