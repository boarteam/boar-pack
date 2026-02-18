import { createContext } from "react";
import { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";
import { TelegramSettingsUpdateDto } from "../../tools/api-client/generated";

type TSettingsContext = {
  columns: ProDescriptionsItemProps<TelegramSettingsUpdateDto, 'text'>[]
}

export const SettingsContext = createContext<TSettingsContext | undefined>(undefined);
