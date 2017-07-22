const isIndex = (k: any) => {
    return /^\d+/.test(k);
};

const fill = (arr: any[], obj: any, value: any) => {
    const k = arr.shift();
    // k is the first element, which is taken away from arr
    if (arr.length > 0) {
        // arr is empty make the last value an object and it back through.
        // which will create the {name: { of: { nested:
        obj[k] = obj[k] || (isIndex(arr[0]) ? [] : {});
        // need obj[k] here to have multiple value in one nesting
        // for example: {value: {one: 1, two: 2}}
        fill(arr, obj[k], value);
    } else {
        // finally set final value
        obj[k] = value;
    }
};

/**
 * Expand a dot notated string object into a regular object.
 *
 * Example
 * ~~~
 * const doc = {
 *     "nested.obj.is": "full",
 *     "nested.num": 3,
 *     "tgt.0": 1,
 *     "tgt.1": 2,
 * };
 * const expanded = expandObj(doc);
 * console.log(expanded);
 * // {
 * //     nested: {
 * //         obj: {
 * //             is: "full",
 * //         },
 * //         num: 3,
 * //     },
 * //     tgt: [1, 2],
 * // }
 * ~~~
 * @param obj
 * @returns {any}
 */
export const expandObj = (obj: any) => {
    Object.keys(obj).forEach((k) => {
        // only operate on values that have dot notation
        if (k.indexOf(".") !== -1) {
            fill(k.split("."), obj, obj[k]);
            // and the old "name.of.nested" is deleted at the end in expandObj
            delete obj[k];
        }
    });
    return obj;
};
