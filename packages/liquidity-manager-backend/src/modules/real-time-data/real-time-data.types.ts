import WebSocket from "ws";

// export enum SubscriptionType {
//   QUOTES = 'quotes',
//   POSITIONS = 'positions',
//   USER_INFO = 'user_info',
// }

export type TQuotesSubscriptionConfig = {
  // type: SubscriptionType.QUOTES;
  symbols: string[];
}

export type TPositionsSubscriptionConfig = {
  // type: SubscriptionType.POSITIONS;
  userId: number;
}

export type TUserInfoSubscriptionConfig = {
  // type: SubscriptionType.USER_INFO;
  userId: number;
}

export type TConnectorConfig = {
  moduleId: number;
  socket: WebSocket | null;
  quotesSubscription: TQuotesSubscriptionConfig | null;
  positionsSubscription: TPositionsSubscriptionConfig | null;
  userInfoSubscription: TUserInfoSubscriptionConfig | null;
}
