export class TelegramSettingsDto {
  enabled: boolean;
  botToken: string | null;
  chatId: string | null;
  notifyAboutInstruments: boolean;
  notifyAboutPlatforms: boolean;
  notifyAboutQuotesByProvider: boolean;
}
