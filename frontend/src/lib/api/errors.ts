import axios from "axios";

/**
 * Shape of the error body the API returns, both for domain errors
 * (`{ statusCode, error, message }`) and for validation errors
 * from Nest's ValidationPipe (`message` is a string[]).
 */
interface ApiErrorBody {
  statusCode?: number;
  error?: string;
  message?: string | string[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly code: string | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Normalizes anything thrown by an API call into a user-facing ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    const message = Array.isArray(body?.message)
      ? body.message.join(". ")
      : body?.message;
    return new ApiError(
      message ?? (error.response ? "Request failed" : "Could not reach the server"),
      error.response?.status ?? null,
      body?.error ?? null,
    );
  }

  return new ApiError(
    error instanceof Error ? error.message : "Unexpected error",
    null,
    null,
  );
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}
