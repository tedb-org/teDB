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

export function rmArrDups(arr: any[]) {
    const seen: any = {};
    const ret: any = [];
    for (let i = 0; i < arr.length; i++) {
        if (!(arr[i] in seen)) {
            ret.push(arr[i]);
            seen[arr[i]] = true;
        }
    }
    return ret;

}
