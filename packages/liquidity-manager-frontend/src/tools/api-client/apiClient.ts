import { ApiClient } from "./generated";

export default new ApiClient({
  BASE: '/api',
  ENCODE_PATH: encodeURIComponent,
});
