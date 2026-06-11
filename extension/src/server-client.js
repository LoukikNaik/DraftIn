export const defaultServerEndpoint = "http://127.0.0.1:17391/generate";

export async function generateMessage({
  payload,
  endpoint = defaultServerEndpoint,
  fetchFn = globalThis.fetch,
}) {
  try {
    const response = await fetchFn(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(body?.error?.message ?? `Local server returned HTTP ${response.status}`);
    }

    return body;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Start the local draftin server on 127.0.0.1:17391, then try again.");
    }

    throw error;
  }
}
