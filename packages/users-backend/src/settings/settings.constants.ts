export const Telegram = {
  BotToken: 'telegram.bot_token',
  ChatId: 'telegram.chat_id',
  Enabled: 'telegram.enabled',
} as const;

export enum Notifications {
  QuotesByProviderStatus = 'notifications.quotes_by_provider_status',
}
