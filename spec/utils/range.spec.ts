import { range } from "../../src/utils";

describe("testing range function", () => {

    test("range", () => {
        const numbers: number[] = range(-10, 10) as number[];
        const strings: string[] = range("a", "d") as string[];
        const opNumbers: number[] = range(5, -5) as number[];
        const opStrings: string[] = range("d", "a") as string[];
        const K: string[] = range("K", "K") as string[];
        const one: number[] = range(1, 1) as number[];

        function fail() {
            range(1, "a");
        }

        expect(numbers).toEqual(expect.arrayContaining([-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
        expect(opNumbers).toEqual(expect.arrayContaining([5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5]));
        expect(strings).toEqual(expect.arrayContaining(["a", "b", "c", "d"]));
        expect(opStrings).toEqual(expect.arrayContaining(["d", "c", "b", "a"]));
        expect(K).toEqual(expect.arrayContaining(["K"]));
        expect(one).toEqual(expect.arrayContaining([1]));
        expect(fail).toThrowError("Did not supply matching types number or string.");
    });


});
