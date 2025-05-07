import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";

@Injectable()
export class ScheduleService implements OnApplicationBootstrap {
  constructor(private schedulerRegistry: SchedulerRegistry) {
  }

  onApplicationBootstrap() {
    const isDisabled = process.env.SWAGGER === 'true';
    // Disable all cron jobs, intervals and timeouts
    if (isDisabled) {
      this.stopAllCronJobs();
      this.deleteAllIntervals();
      this.deleteAllTimeouts();
    }
  }

  private stopAllCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();

    jobs.forEach(job => {
        job.stop();
      }
    )
  }

  private deleteAllIntervals() {
    const intervals = this.schedulerRegistry.getIntervals();
    intervals.forEach(key => {
      this.schedulerRegistry.deleteInterval(key);
    });
  }

  private deleteAllTimeouts() {
    const timeouts = this.schedulerRegistry.getTimeouts();
    timeouts.forEach(key => {
      this.schedulerRegistry.deleteTimeout(key);
    });
  }
}

export default ScheduleService;
