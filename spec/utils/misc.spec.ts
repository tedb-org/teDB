import { isEmpty, getSortType, mergeSort, getPath , rmObjDups} from "../../src/utils";

describe("testing miscellaneous methods", () => {

    test("rmObjDups", () => {
        // length 20 docs
        const docs = [
            {a: 1, b: 2}, {a: 1, b: 2}, {a: 1, b: 2}, {a: 1, b: 2}, {a: 1, b: 2}, {a: 1, b: 2}, {a: 1, b: 2}, {a: 1, b: 2}, {a: 2, b: 3}, {a: 2, b: 3}, {a: 2, b: 3}, {a: 2, b: 3}, {a: 2, b: 3}, {a: 2, b: 3}, {a: 2, b: 3}, {a: 2, b: 3}, {a: 2, b: 3}, {a: 2, b: 3}, {a: 2, b: 3}, {a: 2, b: 3},
        ];
        let docs2 = [];
        for (let i = 0; i <= 10000; i++) {
            docs2 = [...docs2, ...docs];
        }
        expect(rmObjDups(docs, "a").length).toEqual(2);
        expect(rmObjDups(docs2, "a").length).toEqual(2);
    });

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

    test("sortObj", () => {
        const test1 = { sort: { name: -1 }};
        const test1key = Object.keys(test1.sort)[0];
        const test1v = test1.sort[test1key];
        const test2 = { sort: { age: -1 }};
        const test2key = Object.keys(test2.sort)[0];
        const test2v = test2.sort[test2key];
        const test3 = { sort: { date: -1 }};
        const test3key = Object.keys(test3.sort)[0];
        const test3v = test3.sort[test3key];
        const test4 = { sort: { age: 1 }};
        const test4key = Object.keys(test4.sort)[0];
        const test4v = test4.sort[test4key];
        const test5 = { sort: { date: 1}};
        const test5key = Object.keys(test5.sort)[0];
        const test5v = test5.sort[test5key];

        const testers = [
            {name: "a", age: 1, date: new Date("1/2/2017") },
            {name: "c", age: 6, date: new Date("1/1/2017") },
            {name: "b", age: 5, date: new Date("1/4/2017") },
        ];

        const type1 = getSortType(testers, test1key);
        const type2 = getSortType(testers, test2key);
        const type3 = getSortType(testers, test3key);
        const type4 = getSortType(testers, test4key);
        const type5 = getSortType(testers, test5key);

        expect(mergeSort(testers, test3key, test3v, type3)).toEqual(expect.arrayContaining([ { name: "b", age: 5, date: new Date("1/4/2017") },
        { name: "a", age: 1, date: new Date("1/2/2017") },
        { name: "c", age: 6, date: new Date("1/1/2017") } ]));
        expect(mergeSort(testers, test5key, test5v, type5)).toEqual(expect.arrayContaining([ { name: "c", age: 6, date: new Date("1/1/2017") },
        { name: "a", age: 1, date: new Date("1/2/2017") },
        { name: "b", age: 5, date: new Date("1/4/2017") } ]));
        expect(mergeSort(testers, test1key, test1v, type1)).toEqual(expect.arrayContaining([ { name: "c", age: 6, date: new Date("1/1/2017") },
        { name: "b", age: 5, date: new Date("1/4/2017") },
        { name: "a", age: 1, date: new Date("1/2/2017") } ]));
        expect(mergeSort(testers, test2key, test2v, type2)).toEqual(expect.arrayContaining([ { name: "c", age: 6, date: new Date("1/1/2017") },
        { name: "b", age: 5, date: new Date("1/4/2017") },
        { name: "a", age: 1, date: new Date("1/2/2017") } ]));
        expect(mergeSort(testers, test4key, test4v, type4)).toEqual(expect.arrayContaining([ { name: "a", age: 1, date: new Date("1/2/2017") },
        { name: "b", age: 5, date: new Date("1/4/2017") },
        { name: "c", age: 6, date: new Date("1/1/2017") } ]));
    });

    test("getPath", () => {
        const doc = {
            name: "Charles Xavier",
            age: 78,
            occupation: "Professor",
            students: [
                "Wolverine",
                "Blue Falcon",
                "Chad",
            ],
            nested: {
                name: "sneaky",
            },
        };

        const key: string = getPath(doc, "name");
        const numKey: number = getPath(doc, "age");
        const missingKey: any = getPath(doc, "lost");
        const students: string[] = getPath(doc, "students");
        const nested: string = getPath(doc, "nested.name");

        expect(key).toBe("Charles Xavier");
        expect(numKey).toBe(78);
        expect(missingKey).toBe(undefined);
        expect(students).toEqual(expect.arrayContaining(["Wolverine", "Blue Falcon", "Chad"]));
        expect(nested).toBe("sneaky");
    });

});
