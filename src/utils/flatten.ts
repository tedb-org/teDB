/**
 * un-nest nested arrays
 *
 * Examples
 * ~~~
 * const arr = [[1], [2]];
 * console.log(flatten(arr)); // [1, 2];
 *
 * const arr2 = [1, [2], [3, 4, [5]], [[6,[7]]];
 * console.log(flatten(arr2); // [1, 2, 3, 4, 5, 6, 7];
 * ~~~
 * @param {any[]} arr
 * @returns {any[]}
 */
export const flatten = (arr: any[]): any[] => {
    const flat = [].concat(...arr);
    return flat.some(Array.isArray) ? flatten(flat) : flat;
};
