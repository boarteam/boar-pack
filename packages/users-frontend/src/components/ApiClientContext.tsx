import { createContext, useContext } from "react";
import { ApiClient } from "../tools/api-client/generated";

const ApiClientContext = createContext<ApiClient | undefined>(undefined);

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error("useApiClient must be used within an ApiClientProvider.");
  }
  return client;
}

export const ApiClientProvider = ApiClientContext.Provider;
