export const getPath = (obj: any, path: string) =>  {
    const paths = path.split(".");
    let current = obj;

    for (const p of paths) {
        if (current[p] === undefined) {
            return undefined;
        } else {
            current = current[p];
        }
    }
    return current;
};
