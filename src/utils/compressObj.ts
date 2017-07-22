/**
 * Compress an object into string notation. Used with TeDB's indexing
 *
 * Example
 * ~~~
 * const doc = {
 *     nested: {
 *         obj: {
 *             is: "full",
 *         },
 *         num: 3,
 *     },
 *     tgt: [1, 2],
 * }
 * const target: any = {};
 * compressObj(doc, target);
 * console.log(target);
 * // {
 * //    "nested.obj.is": "full",
 * //    "nested.num": 3,
 * //    "tgt.0": 1,
 * //    "tgt.1": 2,
 * // }
 * ~~~
 *
 * @param obj
 * @param tgt
 * @param {any[]} path
 * @returns {any}
 */
export const compressObj = (obj: any, tgt: any = {}, path: any[] = []) => {
    Object.keys(obj).forEach((key) => {
        if (Object(obj[key]) === obj[key] &&
            (Object.prototype.toString.call(obj[key]) === "[object Object]") ||
            (Object.prototype.toString.call(obj[key]) === "[object Array]")
        ) {
            return compressObj(obj[key], tgt, path.concat(key));
        } else {
            tgt[path.concat(key).join(".")] = obj[key];
        }
    });
    return tgt;
};
