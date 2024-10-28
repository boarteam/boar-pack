export class UserInfoDto {
  id: number;
  name: string;
  groupName: string;
  leverage: number;
  currency: string;
  accountState: {
    balance: number;
    margin: number;
    profit: number;
  };
}
