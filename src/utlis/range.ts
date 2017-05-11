const numRange = ( start: number, end: number): number[] => {
    const total: number[] = [];

    // least - greatest
    if (start < end) {
        for (let i = end; i >= start; i--) {
            total.push(i);
        }
    } else if (start > end) { // greatest - least
        for (let i = start; i >= end; i--) {
            total.push(i);
        }
    } else { // equal
        total.push(start);
    }

    return total;
};

const utf8Range = (start: string | number, end: string | number): string[] => {
    const all: string[] = [];
    const s: number = typeof start === "string" ? start.charCodeAt(0) : start;
    const e: number = typeof end === "string" ? end.charCodeAt(0) : end;

    // least - greatest
    if (s < e) {
        for (let i = s; i <= e; i++) {
            all.push(String.fromCharCode(i));
        }
    } else if (s > e) { // greatest - least
        for (let i = s; i >= e; i--) {
            all.push(String.fromCharCode(i));
        }
    } else { // equal
        all.push(String.fromCharCode(s));
    }

    return all;
};

export const range = (start: string | number, end: string | number): number[] | string[] => {
    let all: number[] | string[]  = [];
    if (typeof start === "string" && typeof end === "string") {
        all = utf8Range(start, end);
    } else if (typeof start === "number" && typeof end === "number") {
        all = numRange(start, end);
    } else {
        throw new Error("Did not supply matching types number or string.");
    }
    return all;
};
