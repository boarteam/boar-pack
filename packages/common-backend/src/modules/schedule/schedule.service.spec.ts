import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ScheduleModule } from './schedule.module';

describe('ScheduleService', () => {
  const originalSwagger = process.env.SWAGGER;
  let module: TestingModule;

  afterEach(async () => {
    if (originalSwagger === undefined) {
      delete process.env.SWAGGER;
    } else {
      process.env.SWAGGER = originalSwagger;
    }
    // close() triggers the schedule orchestrator's shutdown hook which clears
    // whatever is still registered, so no timers leak out of a test.
    await module?.close();
  });

  // Registers one of each job kind before lifecycle hooks run, like decorated
  // jobs mounted by the orchestrator would be.
  async function compileWithJobs() {
    module = await Test.createTestingModule({
      imports: [ScheduleModule],
    }).compile();

    const registry = module.get(SchedulerRegistry);

    const job = new CronJob('0 0 1 1 *', () => undefined);
    job.start();
    registry.addCronJob('test-cron', job);
    registry.addInterval(
      'test-interval',
      setInterval(() => undefined, 60_000),
    );
    registry.addTimeout(
      'test-timeout',
      setTimeout(() => undefined, 60_000),
    );

    return { registry, job };
  }

  it('stops cron jobs and deletes intervals/timeouts on bootstrap when SWAGGER=true', async () => {
    process.env.SWAGGER = 'true';
    const { registry, job } = await compileWithJobs();
    expect(job.isActive).toBe(true);

    await module.init();

    expect(job.isActive).toBe(false);
    // cron jobs are only stopped, they stay in the registry
    expect(Array.from(registry.getCronJobs().keys())).toEqual(['test-cron']);
    expect(registry.getIntervals()).toEqual([]);
    expect(registry.getTimeouts()).toEqual([]);
  });

  it('leaves all registered jobs alone when SWAGGER is not set', async () => {
    delete process.env.SWAGGER;
    const { registry, job } = await compileWithJobs();

    await module.init();

    expect(job.isActive).toBe(true);
    expect(registry.getIntervals()).toEqual(['test-interval']);
    expect(registry.getTimeouts()).toEqual(['test-timeout']);
  });

  it('treats any SWAGGER value other than "true" as disabled', async () => {
    process.env.SWAGGER = '1';
    const { registry, job } = await compileWithJobs();

    await module.init();

    expect(job.isActive).toBe(true);
    expect(registry.getIntervals()).toEqual(['test-interval']);
    expect(registry.getTimeouts()).toEqual(['test-timeout']);
  });
});
