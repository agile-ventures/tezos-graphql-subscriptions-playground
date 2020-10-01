import { isPlainObject, camelCase, isArray, each } from 'lodash';

function convertToCamelCase(obj: any): any {
    if (isPlainObject(obj)) {
        let result: any = {};
        each(obj, (v, k) => {
            result[camelCase(k)] = convertToCamelCase(v);
        });
        return result;
    } else if (isArray(obj)) {
        return obj.map(convertToCamelCase);
    } else {
        return obj;
    }
}

export function convertResponse<T>(response: any): T {
    return convertToCamelCase(response) as T;
}

export function convertResponseOrNull<T>(response: any | null): T | null {
    if (!response) {
        return null;
    }

    let result = convertResponse<T>(response!);
    let resultString = JSON.stringify(result);
    console.log(resultString)
    return result;
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

