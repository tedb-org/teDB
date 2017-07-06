/**
 * Private method used in compareArray.
 * @param a
 * @param b
 * @returns {boolean}
 */
const isEqual = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length) {
        return false;
    }

    if (a.length === 0) {
        return true;
    }

    const len = a.length;
    let equal = true;

    for (let i = 0; i < len; i++) {
        const x = a[i];
        const y = b[i];

        equal = equal && (x === y);
    }

    return equal;
};

/**
 * Compare two arrays of equal length, does not deep compare objects in arrays
 *
 * Example:
 * ~~~
 * let equal: number = compareArray([1, 2, 3], [1, 2, 3]); // 0
 * let greater: number = compareArray(["b"], ["a"]); // 1
 * let less: number = compareArray([new Date("1/1/2017")], [new Date()]); // -1
 * ~~~
 * @param a
 * @param b
 * @returns {number}
 */
export const compareArray = (a: any[], b: any[]): number => {
    const array1 = a;
    const array2 = b;
    for (let i = a.length - 1; i >= 0; i--) {
        if (a[i].constructor.name === "Date") {
            array1[i] = a[i].getTime();
        }
    }
    for (let i = b.length - 1; i >= 0; i--) {
        if (b[i].constructor.name === "Date") {
            array2[i] = b[i].getTime();
        }
    }
    const aStr = array1.toString();
    const bStr = array2.toString();

    if (isEqual(array1, array2)) {
        return 0;
    } else if (aStr < bStr) {
        return -1;
    } else if (aStr > bStr) {
        return 1;
    } else {
        throw new Error("Values cannot be compared");
    }
};
