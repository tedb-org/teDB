export const getPath = (obj: any, path: string, defaultValue?: any): any =>
    path.split(".").reduce((o, i) => o[i], obj) || defaultValue;
