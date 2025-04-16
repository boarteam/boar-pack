export const Telegram = {
  BotToken: 'telegram.bot_token',
  ChatId: 'telegram.chat_id',
  Enabled: 'telegram.enabled',
} as const;

export enum Notifications {
  InstrumentsStatus = 'notifications.instruments_status',
  PlatformStatus = 'notifications.platform_status',
}
