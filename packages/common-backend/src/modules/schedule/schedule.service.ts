import { Injectable, OnModuleInit } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";

@Injectable()
export class ScheduleService implements OnModuleInit {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  onModuleInit() {
    const isDisabled = process.env.SWAGGER;
    // Disable all cron jobs, intervals and timeouts
    if (isDisabled) {
      setTimeout(() => this.stopAllCronJobs(), 0);
      setTimeout(() => this.deleteAllIntervals(), 0);
      setTimeout(() => this.deleteAllTimeouts(), 0);
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
