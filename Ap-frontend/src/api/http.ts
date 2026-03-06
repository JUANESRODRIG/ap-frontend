const API_BASE_URL =
    (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${path}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers ?? {}),
        },
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
            `API request failed (${response.status}): ${text || response.statusText}`
        );
    }

    return (await response.json()) as T;
}

