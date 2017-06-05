/**
 * Are these empty? [], {}, "", null, undefined. returns true
 * @param obj
 * @returns {boolean}
 */
export const isEmpty = (obj: any) => {
    if (!obj && obj !== 0) {
        return true;
    }

    if (!(typeof(obj) === "number") && !Object.keys(obj).length) {
        return true;
    }

    return false;
};
