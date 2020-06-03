export function mapAsync<T1, T2>(
    array: T1[],
    callback: (value: T1, index: number, array: T1[]) => Promise<T2>,
): Promise<T2[]> {
    return Promise.all(array.map(callback));
}

export async function filterAsync<T>(
    array: T[],
    callback: (value: T, index: number, array: T[]) => Promise<boolean>,
): Promise<T[]> {
    const filterMap = await mapAsync(array, callback);
    return array.filter((_, index) => filterMap[index]);
}
