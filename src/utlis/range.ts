/**
 * Returns a range of numerical values given numbers
 * @param start
 * @param end
 * @returns {number[]}
 */
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

/**
 * Returns a range of utf8 characters based on position in utf8 range
 * @param start
 * @param end
 * @returns {string[]}
 */
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

/**
 * Uses utf8Range and numRange to return a range.
 *
 * Example
 * ~~~
 * let numbers: number[] = range(1, 5); // [1, 2, 3, 4, 5]
 * let reverse: number[] = range(5, 1); // [5, 4, 3, 2, 1]
 * let letters: string[] = range("a", "d"); // ["a", "b", "c", "d"]
 * let reverseL: string[] = range("d", "a"); // ["d", "c", "b", "a"]
 * ~~~
 *
 * @param start
 * @param end
 * @returns {number[]|string[]}
 */
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
