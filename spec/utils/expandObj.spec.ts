import { expandObj } from "../../src/utils";

describe("expanding object using dot notated values", () => {

    test("simple object expanstion", () => {
        const doc = {
            "value.one": 1,
            "notNested": 2,
        };
        const expanded = expandObj(doc);
        expect(expanded.value.one).toEqual(1);
        expect(expanded.notNested).toEqual(2);
    });

    test("multi value nesting", () => {
        const doc = {
            "value.one": 1,
            "value.two": 2,
            "init": 0,
        };
        const expanded = expandObj(doc);
        expect(expanded.value.one).toEqual(1);
        expect(expanded.value.two).toEqual(2);
        expect(expanded.init).toEqual(0);
    });

    test("arrays", () => {
        const doc = {
            "nested.0": 2,
            "nested.1": 1,
        };
        const a = expandObj(doc);
        expect(a.nested[0]).toEqual(2);
        expect(a.nested[1]).toEqual(1);
    });

    test("mixed", () => {
        const doc = {
            "value.one": 1,
            "value": {
                two: 2,
            },
        };
        const a = expandObj(doc);
        expect(a.value.one).toEqual(1);
        expect(a.value.two).toEqual(2);
    });
});
