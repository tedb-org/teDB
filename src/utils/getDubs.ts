/**
 * Get the duplicate items of two arrays
 *
 * Examples:
 * ~~~
 * let a = [1, 2, 3];
 * let b = [1];
 * let c = getDubs(a, b);
 * console.log(c); // [1];
 * ~~~
 * @param {any[]} arr1
 * @param {any[]} arr2
 * @returns {any[]}
 */
export const getDubs = (arr1: any[], arr2: any[]): any[] => {
    return arr1.filter((val) => arr2.indexOf(val) !== -1);
};
