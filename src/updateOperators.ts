// All update operators
import { isEmpty } from "./utlis";

/**
 * Method used by all update operators except $rename
 * to updated nested object values by use of a string - `"nested.doc.key"`
 *
 * Examples:
 * ~~~
 * let obj = {nested: {doc: {key: 1}}};
 *
 * operate(obj, "nested.doc.key", 2, "set");
 * // obj = {nested: {doc: {key: 2}}}
 *
 * operate(obj, "nested.doc.key", -1, "inc");
 * // obj = {nested: {doc: {key: 1}}}
 *
 * operate(obj, "nested.doc.key", 3, "mul");
 * // obj = {nested: {doc: {key: 3}}}
 *
 * operate(obj, "nested.doc.key", "", "unset");
 * // obj = {nested: {doc: {}}}
 * ~~~
 * @param obj - object to update
 * @param is - "string.location"
 * @param value - input
 * @param type - operator type `string`
 * @returns {any}
 */
const operate = (obj: any, is: any, value: any, type: string): any => {
    if (typeof is === "string") {
        return operate(obj, is.split("."), value, type);
    } else if ((is.length === 1) && (value !== undefined)) {
        switch (type) {
            case "set":
                return obj[is[0]] = value;
            case "mul":
                return obj[is[0]] = obj[is[0]] * value;
            case "inc":
                return obj[is[0]] = obj[is[0]] + value;
            case "unset":
                return delete obj[is[0]];
        }
    } else if (is.length === 0) {
        return obj;
    } else {
        return operate(obj[is[0]], is.slice(1), value, type);
    }
};

/**
 * Replace a value
 *
 * Example:
 * ~~~
 * let obj = {nested: {layer1: {}}};
 * $set(obj, {"nexted.layer1.newSet": "value"})
 *  .then((res) => console.log(res)) // {nested: {layer: {newSet: "value"}}}
 *  .catch();
 * ~~~
 * @param obj
 * @param set
 * @returns {Promise<T>}
 */
export const $set = (obj: any, set: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (isEmpty(set)) {
            return reject(new Error("Empty $set object"));
        }
        const returnObj: any = obj;
        const setKeys: any = Object.keys(set);
        try {
            setKeys.forEach((path: string) => operate(returnObj, path, set[path], "set"));
            resolve(returnObj);
        } catch (e) {
            return reject(e);
        }
    });
};

/**
 * Multiply a value
 *
 * Example:
 * ~~~
 * let obj = {nested: {num: 2}};
 * $mul(obj, {"nested.num": 3})
 *  .then((res) => console.log(res)) // {nested: {num: 6}}
 *  .catch();
 * ~~~
 * @param obj
 * @param mul
 * @returns {Promise<T>}
 */
export const $mul = (obj: any, mul: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (isEmpty(mul)) {
            return reject(new Error("Empty $mul object"));
        }
        const returnObj: any = obj;
        const mulKeys: any = Object.keys(mul);
        try {
            mulKeys.forEach((path: string) => operate(returnObj, path, mul[path], "mul"));
            resolve(returnObj);
        } catch (e) {
            return reject(e);
        }
    });
};

/**
 * Increment a value or subtract from a value.
 *
 * Example:
 * ~~~
 * let obj = {nested: {num: 1}};
 * $inc(obj, {"nested.num": -1})
 *  .then((res) => console.log(res)) // {nested: {num: 0}}
 *  .catch();
 * ~~~
 * @param obj
 * @param inc
 * @returns {Promise<T>}
 */
export const $inc = (obj: any, inc: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (isEmpty(inc)) {
            return reject(new Error("Empty $inc object"));
        }
        const returnObj: any = obj;
        const incKeys: any = Object.keys(inc);
        try {
            incKeys.forEach((path: string) => operate(returnObj, path, inc[path], "inc"));
            resolve(returnObj);
        } catch (e) {
            return reject(e);
        }
    });
};

/**
 * Remove key/value
 *
 * Example:
 * ~~~
 * let obj = {nested: {v: "value}};
 * $unset(obj, {"nested.v": ""})
 *  .then((res) => console.log(res)) // {nested: {}}
 *  .catch();
 * ~~~
 * @param obj
 * @param unset
 * @returns {Promise<T>}
 */
export const $unset = (obj: any, unset: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (isEmpty(unset)) {
            return reject(new Error("Empty $unset object"));
        }
        const returnObj: any = obj;
        const unsetKeys: any = Object.keys(unset);
        try {
            unsetKeys.forEach((path: string) => operate(returnObj, path, unset[path], "unset"));
            resolve(returnObj);
        } catch (e) {
            return reject(e);
        }
    });
};

/**
 * Rename a key
 *
 * Example:
 * ~~~
 * let obj = {nested: {v: "value"}};
 * $rename(obj, {"nested.v": "key"})
 *  .then((res) => console.log(res)) // {nested: {key: "value"}}
 *  .catch();
 * ~~~
 * @param obj
 * @param rename
 * @returns {Promise<T>}
 */
export const $rename = (obj: any, rename: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (isEmpty(rename)) {
            return reject(new Error("Empty $rename object"));
        }
        const returnObj: any = obj;
        const renameKeys: any = Object.keys(rename);
        try {
            renameKeys.forEach((path: string) => {
                let keyValue: any;
                // Delete the key but save the value
                const del = (thisObject: any, is: any, value: any): any => {
                    if (typeof is === "string") {
                        return del(thisObject, is.split("."), value);
                    } else if ((is.length === 1) && (value !== undefined)) {
                        keyValue = thisObject[is[0]];
                        return delete thisObject[is[0]];
                    } else if (is.length === 0) {
                        return thisObject;
                    } else {
                        return del(thisObject[is[0]], is.slice(1), value);
                    }
                };
                del(returnObj, path, rename[path]);
                if (keyValue) {
                    const splitPath = path.split(".");
                    splitPath.pop();
                    splitPath.push(rename[path]);
                    const newPath = splitPath.join(".").toString();
                    // then set new key/value
                    operate(returnObj, newPath, keyValue, "set");
                } else {
                    return reject(new Error("Value to rename was not found"));
                }
            });
            resolve(returnObj);
        } catch (e) {
            return reject(e);
        }
    });
};
