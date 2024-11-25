export class UserInfoDto {
  id: number;
  name: string;
  groupName: string;
  leverage: string;
  currency: string;
  balance: string;
  margin: string;
  profit: string;
  equity: string;
  freeMargin: string;
  marginLevel: string;
}

export class AccountStateDto {
  balance: string;
  margin: string;
  profit: string;
}
