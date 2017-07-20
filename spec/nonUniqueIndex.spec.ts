import { Index, Datastore } from "../src";
import { MockStorageDriver } from "./example";

describe("testing a non unique indexed datastore", () => {
    const CWD = process.cwd();
    const testStorage = new MockStorageDriver("test");
    const Tests = new Datastore({storage: testStorage});
    const docs = [
        {name: "a"},
        {name: "a"},
        {name: "b"},
        {name: "b"},
    ];
    test("ensuring index + insert", () => {
        expect.assertions(1);
        return Tests.ensureIndex({fieldName: "name", unique: false})
            .then(() => {
                const promises: Array<Promise<any>> = [];
                docs.forEach((d) => {
                    promises.push(Tests.insert(d));
                });
                return Promise.all(promises);
            })
            .then((res) => {
                expect(res.length).toEqual(4);
            });
    });

    test("saving index", () => {
        expect.assertions(1);
        return Tests.getIndices()
            .then((indices) => {
                const ind: Index = indices.get("name");
                if (ind) {
                    return ind.toJSON();
                }
            })
            .then((res) => {
                res = JSON.parse(res);
                expect(res.length).toEqual(2);
            });
    });

});
