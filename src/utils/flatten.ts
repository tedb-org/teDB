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
export function flatten(arr: any) {
    const toString = Object.prototype.toString;
    const arrayTypeStr = "[object Array]";

    const result: any = [];
    const nodes = arr.slice();
    let node;

    if (!arr.length) {
        return result;
    }

    node = nodes.pop();

    do {
        if (toString.call(node) === arrayTypeStr) {
            nodes.push.apply(nodes, node);
        } else {
            result.push(node);
        }
    } while (nodes.length && (node = nodes.pop()) !== undefined);

    result.reverse(); // we reverse result to restore the original order
    return result;
}
