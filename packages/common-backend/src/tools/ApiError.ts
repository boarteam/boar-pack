// Should be synced with common-frontend/src/tools/ApiError.ts
export type TApiErrorBodyType = {
    statusCode: number
    message: string
    errors: {
        field: string,
        message: string
    }[]
}

// Copied from api-client/generated/core/ApiError.ts
class ApiError extends Error {
    public readonly url: string;
    public readonly status: number;
    public readonly statusText: string;
    public readonly body: TApiErrorBodyType;
    public readonly request: any;
}
