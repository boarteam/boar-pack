import { UserConnectionTarget } from "../entities/users-connections-statistic.entity";

export class UsersConnectionsStatisticDto {
  time: string;
  records: number;
  userId: string;
  target: UserConnectionTarget;
  startTime: string;
  endTime: string;
}
