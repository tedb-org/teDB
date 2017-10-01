import { Index, Datastore } from "../../src";
import { MockStorageDriver } from "../example";
import * as fs from "fs";

describe("testing indexed falsy", () => {
    const CWD = process.cwd();
    const testStorage = new MockStorageDriver("test2");
    const Tests = new Datastore({storage: testStorage});
    const docs = [
        {name: ""},
        {name: ""},
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
            expect(res.length).toEqual(2);
        });
    });

    test("saving index", () => {
        expect.assertions(2);
        return Tests.getIndices()
        .then((indices) => {
            const promises: Array<Promise<null>> = [];
            indices.forEach((v: Index, k: string) => {
                promises.push(Tests.saveIndex(k));
            });
            return Promise.all(promises);
        })
        .then(() => {
            return testStorage.fetchIndex("name");
        })
        .then((res) => {
            expect(res.length).toEqual(1);
            expect(res[0].value.length).toEqual(2);
        });
    });

    test("updating falsy to itself", () => {
        return Tests.find({name: ""}).exec()
            .then((res) => {
                res = res as any[];
                const promises: Array<Promise<any>> = [];
                res.forEach((doc) => {
                    promises.push(Tests.update({
                            name: doc._id,
                        }, {
                            $set: {
                                name: false,
                            },
                        }, {
                            returnUpdatedDocs: true,
                        }));
                });
                return Promise.all(promises);
            })
            .then((res) => {
            });

    });

    test("finding ''", () => {
        expect.assertions(1);
        return Tests.find({name: ""})
        .exec()
        .then((res) => {
            res = res as any[];
            expect(res.length).toEqual(2);
        });
    });

    test("clear datastore tests", () => {
        expect.assertions(1);
        return testStorage.clear()
        .then(() => {
            const exists = fs.existsSync(`${CWD}/spec/example/db/test2`);
            expect(exists).toBe(false);
        });
    });

});
