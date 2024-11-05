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
    equity: number;
    freeMargin: number;
    marginLevel: number;
  };
}
