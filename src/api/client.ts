const strings = {
  networkFailed: 'Network request failed',
  requestFailed: (status: number) => `Request failed (${status})`,
  networkRetry: 'Network request failed. Check your connection and try again.',
  somethingWentWrong: 'Something went wrong.',
};

export type ApiErrorKind = 'network' | 'http' | 'graphql';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

export async function restGet<T>(
  url: string,
  headers?: HeadersInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, headers ? { headers } : undefined);
  } catch {
    throw new ApiError('network', strings.networkFailed);
  }

  if (!response.ok) {
    throw new ApiError(
      'http',
      strings.requestFailed(response.status),
      response.status
    );
  }

  return (await response.json()) as T;
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === 'network') {
      return strings.networkRetry;
    }
    return error.message;
  }
  return strings.somethingWentWrong;
}
