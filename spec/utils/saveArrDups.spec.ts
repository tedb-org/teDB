import {saveArrDups, isEmpty} from "../../src/utils";

describe("saveArrDups", () => {

    test("should get empty array", () => {
        expect.assertions(1);
        const arr = [[], [], ["a", "b", "c"]];
        return saveArrDups(arr)
            .then((res) => {
                expect(isEmpty(res)).toEqual(true);
            });
    });

    test("should also get empty array", () => {
        expect.assertions(1);
        const arr = [["a"], [], ["a", "b", "c"]];
        return saveArrDups(arr)
        .then((res) => {
            expect(isEmpty(res)).toEqual(true);
        });
    });

    test("should get array of duplicates", () => {
        expect.assertions(1);
        const arr = [["a"], ["a", "b"], ["a", "b", "c"]];
        return saveArrDups(arr)
            .then((res) => {
                expect(res).toEqual(expect.arrayContaining(["a", "a", "a"]));
            });
    });

    test("should get empty array as well", () => {
        expect.assertions(1);
        const arr = [["a"], ["b"], ["a, b"]];
        return saveArrDups(arr)
            .then((res) => {
                expect(isEmpty(res)).toEqual(true);
            });
    });

});
