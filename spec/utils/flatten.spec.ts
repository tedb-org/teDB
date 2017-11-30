import {flatten} from "../../src/utils";

describe("flatten", () => {

    test("mulit arrays", () => {
        const array = [[1], [2]];
        const fl = flatten(array);
        expect(fl).toEqual(expect.arrayContaining([1, 2]));
    });

    test("nested arrays", () => {
        const array = [
            [1, [2]],
            [3, [4]],
        ];
        const fl = flatten(array);
        expect(fl).toEqual(expect.arrayContaining([1, 2, 3, 4]));
    });

    test("extra nested", () => {
        const array = [
            [1, [2, [3], [4], [5], [6, [7]]]],
            [[[[8, 9], [10], [11, [12, 13]]], [14]]],
        ];
        const fl = flatten(array, false);
        expect(fl).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]));
    });

});
