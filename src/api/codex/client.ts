import { ApiError } from '@/api/client';

const strings = {
  missingApiKey: 'Missing EXPO_PUBLIC_CODEX_API_KEY',
  networkFailed: 'Network request failed',
  requestFailed: (status: number) => `Codex request failed (${status})`,
  missingData: 'Codex response did not include data',
};

const CODEX_URL = 'https://graph.codex.io/graphql';

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

export async function codexGraphql<TData>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  const apiKey = process.env.EXPO_PUBLIC_CODEX_API_KEY;
  if (!apiKey) {
    throw new ApiError('http', strings.missingApiKey);
  }

  let response: Response;
  try {
    response = await fetch(CODEX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({ query, variables }),
    });
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

  const body = (await response.json()) as GraphQLResponse<TData>;
  if (body.errors?.length) {
    throw new ApiError(
      'graphql',
      body.errors.map((error) => error.message).join('; ')
    );
  }
  if (!body.data) {
    throw new ApiError('graphql', strings.missingData);
  }
  return body.data;
}
