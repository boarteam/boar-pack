import { createContext } from "react";

type EventLogsHookResult = {
  serviceNameToAbbreviation: Record<string, string>;
}

export const EventLogsContext = createContext<EventLogsHookResult | undefined>(undefined);
