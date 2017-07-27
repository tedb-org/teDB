/**
 * Get rid of duplicates in array
 *
 * Example:
 * ~~~
 * const a = [1, 1, 1, 2, 2, 3];
 * const b = rmArrDups(a);
 * console.log(b); // [1, 2, 3];
 * ~~~
 * @param {any[]} arr
 * @returns {any[]}
 */
export const rmArrDups = (arr: any[]): any[] => {
    return  arr.filter((v, i) => arr.indexOf(v) === i);
};
