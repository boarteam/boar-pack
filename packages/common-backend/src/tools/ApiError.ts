// Should be synced with common-frontend/src/tools/ApiError.ts
export type TApiErrorBodyType = {
  statusCode: number;
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

// Copied from api-client/generated/core/ApiError.ts
// NOTE: unlike the frontend copy, this class is (probably unintentionally)
// not exported — tracked in the bug follow-up list; exporting it now would
// be an API change.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ApiError extends Error {
  public readonly url: string;
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: TApiErrorBodyType;
  public readonly request: any;
}
