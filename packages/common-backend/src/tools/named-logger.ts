import { ConsoleLogger } from "@nestjs/common";

export class NamedLogger extends ConsoleLogger {
  private readonly prefix: string;

  constructor(prefix?: string) {
    super();
    this.prefix = prefix || 'Nest';
  }

  formatPid(pid: number): string {
    return `[${this.prefix}] ${pid}  - `;
  }
}
