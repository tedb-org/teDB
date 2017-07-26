import { Index, Datastore } from "../../src";
import { MockStorageDriver } from "../example";
import * as fs from "fs";

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
    const nestedDocs = [
        {name: "c", crate: {extended: "testing", gem: "tested"}},
        {name: "c", crate: {extended: "testing", gem: "tested"}},
        {name: "d", crate: {extended: "tst", gem: "gold"}},
        {name: "d", crate: {extended: "tst", gem: "gold"}},
    ];
    let test1: any;

    test("ensuring index + insert", () => {
        expect.assertions(1);
        return Tests.ensureIndex({fieldName: "name", unique: false})
            .then(() => {
                const promises: Array<Promise<any>> = [];
                docs.forEach((d) => {
                    promises.push(Tests.insert(d));
                });
                nestedDocs.forEach((d) => {
                    promises.push(Tests.insert(d));
                });
                return Promise.all(promises);
            })
            .then((res) => {
                expect(res.length).toEqual(8);
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
                expect(res.length).toEqual(4);
            });
    });

    test("inserting new doc", () => {
        expect.assertions(1);
        return Tests.insert({name: "b"})
            .then((res) => {
                test1 = res;
                expect(res.name).toEqual("b");
            });
    });

    test("finding b", () => {
        expect.assertions(1);
        return Tests.find({name: "b"})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(3);
            });
    });

    test("updating test1", () => {
        expect.assertions(5);
        return Tests.update({
                name: "b",
                _id: test1._id,
            }, {
                $set: {
                    field: "test",
                },
            }, {
                returnUpdatedDocs: true,
                upsert: true,
            })
            .then((res) => {
                expect(res[0].field).toEqual("test");
                expect(res[0].name).toEqual("b");
                return Tests.find({name: "b"}).exec();
            })
            .then((res) => {
                expect(res[2].field).toEqual("test");
                expect(res[1].hasOwnProperty("field")).toBeFalsy();
                expect(res[0].hasOwnProperty("field")).toBeFalsy();
            });
    });

    test("finding by _id", () => {
        expect.assertions(2);
        return Tests.find({name: "b", _id: test1._id}).exec()
            .then((res) => {
                expect(res[0].field).toEqual("test");
                expect(res[0].name).toEqual("b");
            });
    });

    test("finding with non-indexed nested", () => {
        expect.assertions(2);
        return Tests.find({"crate.gem": "tested"}).exec()
            .then((res) => {
                expect(res[0].hasOwnProperty("crate")).toBeTruthy();
                expect(res[1].hasOwnProperty("crate")).toBeTruthy();
            });
    });

    test("finding with two fields one indexed one not indexed and nested", () => {
        expect.assertions(3);
        return Tests.find({
                "crate.gem": "tested",
                "name": "c",
            }).exec()
            .then((res) => {
                res = res as any[];
                expect(res[0].hasOwnProperty("crate")).toBeTruthy();
                expect(res[1].hasOwnProperty("crate")).toBeTruthy();
                expect(res.length).toEqual(2);
            });
    });

    test("finding with two un indexed nested fields", () => {
        expect.assertions(5);
        return Tests.find({
                "crate.gem": "gold",
                "crate.extended": "tst",
            }).exec()
            .then((res) => {
                res = res as any[];
                expect(res[0].hasOwnProperty("crate")).toBeTruthy();
                expect(res[1].hasOwnProperty("crate")).toBeTruthy();
                expect(res[0].crate.extended).toEqual("tst");
                expect(res[1].crate.extended).toEqual("tst");
                expect(res.length).toEqual(2);
            });
    });

    test("update with nested fields no upsert", () => {
        expect.assertions(3);
        return Tests.update({
                "crate.gem": "gold",
                "name": "d",
            }, {
                $rename: {"crate.gem": "silver"},
            }, {
                multi: true,
                returnUpdatedDocs: true,
            })
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(2);
                expect(res[0].crate.silver).toEqual("gold");
                expect(res[1].crate.silver).toEqual("gold");
            });
    });

    test("updating with nested fields with upsert, no multi", () => {
        expect.assertions(3);
        return Tests.update({
                crate: {
                    gem: "emerald",
                },
                name: "f",
            }, {
                $set: {
                    "crate.extended": "passing",
                },
            }, {
                returnUpdatedDocs: true,
                exactObjectFind: true,
                upsert: true,
            })
            .then((res) => {
                expect(res[0].crate.gem).toEqual("emerald");
                expect(res[0].crate.extended).toEqual("passing");
                expect(res[0].name).toEqual("f");
            });
    });

    test("viewing indices", () => {
        expect.assertions(5);
        return Tests.getIndices()
            .then((res) => {
                const ind: Index = res.get("name");
                if (ind) {
                    return ind.toJSON();
                }
            })
            .then((res) => {
                const json = JSON.parse(res);
                expect(json[0].key).toEqual("b");
                expect(json[1].key).toEqual("d");
                expect(json[2].key).toEqual("a");
                expect(json[3].key).toEqual("f");
                expect(json[4].key).toEqual("c");
            });
    });

    test("clear datastore tests", () => {
        expect.assertions(1);
        return testStorage.clear()
            .then(() => {
                const exists = fs.existsSync(`${CWD}/spec/example/db/test`);
                expect(exists).toBe(false);
            });
    });

});
