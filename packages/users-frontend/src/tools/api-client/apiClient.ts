import { ApiClient } from "./generated";
import type { OpenAPIConfig } from "./generated";

export function createApiClient(config?: Partial<OpenAPIConfig>): ApiClient {
  return new ApiClient({
    BASE: '/api',
    ENCODE_PATH: encodeURIComponent,
    ...config,
  });
}

export default createApiClient();
