export class UserInfoDto {
  id: number;
  name: string;
  groupName: string;
  leverage: number;
  accountState: {
    balance: number;
    margin: number;
    profit: number;
  };
}
