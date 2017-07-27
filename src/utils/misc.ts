/**
 * Get value given the Path as "path.to.nested" string
 * @param obj
 * @param path
 */
export const getPath = (obj: any, path: string) => {
    return path.split(".").reduce((o, i) => {
        if (o !== undefined) {
            return o[i];
        }
    }, obj);
};
/**
 * Remove duplicate objects from array comparing certain unique field.
 *
 * Example:
 * ~~~
 * let a = [{_id: 1, name: "ch"}, {_id: 1, name: "ch"}]
 * rmDups(a, "_id"); // [{_id: 1, name: "ch"}]
 * ~~~
 * @param arr
 * @param field
 * @returns {any[]}
 */
export const rmObjDups = (arr: any[], field: string): any[] => {
    return arr.filter((obj, pos, ray) => ray.map((mapObj) => mapObj[field]).indexOf(obj[field]) === pos);
};

/**
 * Checks current element if it empty
 *
 * Examples:
 * ~~~
 * isEmpty({}); // true
 * isEmpty([]); // true
 * isEmpty(""); // true
 * isEmpty(null); // true
 * isEmpty(undefined); // true
 * ~~~
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

/**
 * Get the type of element that will be sorted as `[object ${TYPE}]`
 *
 * Examples:
 * ~~~
 * getSortType([{a: 1}], "a"); // [object Number]
 * getSortType([{a: "b"}], "a"); // [object String]
 * getSortType([{a: new Date()}], "a"); // [object Date]
 * getSortType([{a: []}], "a"); // [object Array]
 * getSortType([{a: {}}], "a"); // [object Object]
 * ~~~
 * @param arr - Array to check for type, will not send back a type if null or undefined
 * @param field - field name to check against
 * @returns {string}
 */
export const getSortType = (arr: any[], field: string): string => {
    let type: string = "";
    for (const doc of arr) {
        if (doc.hasOwnProperty(field) && doc[field] !== null && doc[field] !== undefined) {
            type = Object.prototype.toString.call(doc[field]);
            break;
        }
    }
    return type;
};

const merge = (left: any[], right: any[], sortField: string, sort: number, type: string) => {
    const result = [];
    const leftLength: number = left.length;
    const rightLength: number = right.length;
    let l: number = 0;
    let r: number = 0;
    // get the type of field. make sure to get the type from a document that has a filled result
    if (type === "[object Date]" || type === "[object Number]" || type === "[object String]") {
        if (sort === -1) {
            while ( l < leftLength && r < rightLength) {
                if (left[l][sortField] > right[r][sortField]) {
                    result.push(left[l++]);
                } else {
                    result.push(right[r++]);
                }
            }
        } else if (sort === 1) {
            while ( l < leftLength && r < rightLength) {
                if (left[l][sortField] < right[r][sortField]) {
                    result.push(left[l++]);
                } else {
                    result.push(right[r++]);
                }
            }
        }
    } else {
        throw new Error(`Sortable types are [object Date], [object String], and [object Number], this is not a sortable field, ${Object.prototype.toString.call(type)}`);
    }
    return result.concat(left.slice(l)).concat(right.slice(r));
};

/**
 * Sort array of documents using MergeSort
 *
 * Examples:
 * ~~~
 * let docs = [{n: 1}, {n: 6}, {n: 5}];
 * let sort = {n: -1};
 * let key = Object.keys(sort)[0]; // "n"
 * let val = sort[key]; // -1
 * let type = getSortType(docs, key); // "[object Number]"
 * mergeSort(docs, key, val, type); // [{n: 6}, {n: 5}, {n: 1}]
 * ~~~
 * @param toSort - array of documents to sort
 * @param sortField - field name as string from documents
 * @param sortParam - numeric -1 for descending and 1 for ascending sort order
 * @param type - one of the results of Object.prototype.toString.call(obj[field])
 */
export const mergeSort = (toSort: any[], sortField: string, sortParam: number, type: any): any => {
    const len = toSort.length;
    if (len < 2) {
        return toSort;
    }
    const mid = Math.floor(len / 2);
    const left = toSort.slice(0, mid);
    const right = toSort.slice(mid);
    return merge(mergeSort(left, sortField, sortParam, type), mergeSort(right, sortField, sortParam, type), sortField, sortParam, type);
};
