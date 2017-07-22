import {compressObj} from "../../src/utils/compressObj";

describe("compressing objecects to dot notated objects", () => {

    test("compressing simple object no compression", () => {
        const doc = {
            super: "str",
            simple: 3,
        };
        const target: any = {};
        compressObj(doc, target);
        expect(doc.super).toEqual("str");
        expect(doc.simple).toEqual(3);
    });

    test("nested objecct", () => {
        const doc = {
            nested: {
                obj: {
                    is: "full",
                },
            },
        };
        const target: any = {};
        compressObj(doc, target);
        expect(target["nested.obj.is"]).toEqual("full");
    });

    test("nesting with arrays", () => {
        const doc = {
            nested: {
                obj: [1, 2, 3],
            },
            multI: {
                nesting: 1,
                nest: 2,
            },
            base: "str",
        };
        const target: any = {};
        compressObj(doc, target);
        expect(target["nested.obj.0"]).toEqual(1);
        expect(target["nested.obj.1"]).toEqual(2);
        expect(target["nested.obj.2"]).toEqual(3);
        expect(target["multI.nesting"]).toEqual(1);
        expect(target["multI.nest"]).toEqual(2);
        expect(target.base).toEqual("str");
    });
});
