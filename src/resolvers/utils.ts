export function convertResponseOrNull<T>(response: any | null): T | null {
    if (!response) {
        return null;
    }

    return response as T;
}

export async function handleNotFound<T>(run: () => Promise<T>): Promise<T | null> {
    try {
        return await run();
    } catch (e) {
        if (e.status === 404) {
            return null;
        }
        throw e;
    }
}