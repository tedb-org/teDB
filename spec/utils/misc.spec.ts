import { isEmpty } from "../../src/utlis";

describe("testing miscellaneous methods", () => {

    test("isEmpty", () => {
        // empty
        const array: any[] = [];
        const obj: {} = {};
        const str: string = "";
        const nul: null = null;
        const und: undefined = undefined;
        expect(isEmpty(array)).toBe(true);
        expect(isEmpty(obj)).toBe(true);
        expect(isEmpty(str)).toBe(true);
        expect(isEmpty(nul)).toBe(true);
        expect(isEmpty(und)).toBe(true);

        // not empty
        const ar: string[] = ["a"];
        const object: any = {a : "a"};
        const st: string = "abc";
        expect(isEmpty(ar)).toBe(false);
        expect(isEmpty(object)).toBe(false);
        expect(isEmpty(st)).toBe(false);
    });
});
