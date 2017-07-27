import {getDubs} from "./getDubs";

/**
 * Get only duplicates from array of arrays
 *
 * Example:
 * ~~~
 * let a = [[], [], ['a', 'b', 'c']];
 * let b = saveArrDups(a);
 * console.log(b); // [];
 *
 * let a = [['a'], ['a'], ['a', 'b', 'c']];
 * let b = saveArrDups(a);
 * console.log(b); // ['a', 'a', 'a'];
 *
 * let a = [['a', 'a','b','b'], ['c','b','a'],['a','c','b']];
 * let b = saveArrDups(a);
 * console.log(b); // ['a', 'b'];
 * ~~~
 * @param {any[][]} arr
 * @returns {Promise<any[]>}
 */
export const saveArrDups = (arr: any[][]): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        let clear = false;
        const val = arr.reduce((init, item, index) => {
            if (init.length === 0) {
                if (clear) {
                    return init.concat([]);
                } else if (item.length === 0) {
                    clear = true;
                    return init.concat([]);
                } else if (index === 0) {
                    return init.concat(item);
                } else {
                    clear = true;
                    return [];
                }
            } else {
                if (item.length === 0) {
                    clear = true;
                    return [];
                } else {
                    return getDubs(init, item);
                }
            }
        }, []);
        resolve(val);
    });
};
