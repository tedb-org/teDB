import { Index, Datastore } from "../../src";
import { MockStorageDriver } from "../example";
import * as fs from "fs";

describe("testing datastore without indices", () => {
    const CWD = process.cwd();
    const store = new MockStorageDriver("store");
    const DB = new Datastore({storage: store});
    const docs = [
        {isSynced: false, num: 0, time: null, odd: "", manipulate: 1},
        {isSynced: false, num: -1, time: new Date(), odd: "", manipulate: 1},
        {isSynced: true, num: 1, time: null, odd: "string", manipulate: 1},
    ];

    test("inserting", () => {
        expect.assertions(1);
        const promises: Array<Promise<any>> = [];
        docs.forEach((doc) => promises.push(DB.insert(doc)));
        return Promise.all(promises)
            .then((res) => {
                expect(res.length).toEqual(3);
            });
    });

    describe("testing boolean", () => {

        test("finding all false isSynced", () => {
            expect.assertions(1);
            return DB.find({isSynced: false})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(2);
            });
        });

        test("finding one false isSynced", () => {
            expect.assertions(1);
            return DB.find({isSynced: false})
            .limit(1)
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(1);
            });
        });

        test("updating all false isSynced", () => {
            expect.assertions(5);
            return DB.update({isSynced: false}, {
                $set: {manipulate: 2},
            }, {returnUpdatedDocs: true, multi: true})
                .then((res) => {
                    res = res as any[];
                    expect(res.length).toEqual(2);
                    res.forEach((r) => {
                        expect(r.isSynced).toEqual(false);
                        expect(r.manipulate).toEqual(2);
                    });
                });
        });

        test("updating all false isSynced upsert true", () => {
            expect.assertions(5);
            return DB.update({isSynced: false}, {
                $set: {manipulate: 1},
            }, {returnUpdatedDocs: true, multi: true, upsert: true})
                .then((res) => {
                    res = res as any[];
                    expect(res.length).toEqual(2);
                    res.forEach((r) => {
                        expect(r.isSynced).toEqual(false);
                        expect(r.manipulate).toEqual(1);
                    });
                });
        });

        test("updating all with perfect match upsert true, multi false", () => {
            expect.assertions(5);
            return DB.update({
                    isSynced: false,
                    time: null,
                    odd: "",
                    manipulate: 1,
                }, {
                    $set: {manipulate: 2},
                }, {
                    returnUpdatedDocs: true,
                    upsert: true,
                    exactObjectFind: true,
                })
                .then((res) => {
                    res = res as any[];
                    expect(res[0].isSynced).toEqual(false);
                    expect(res[0].num).toEqual(0);
                    expect(res[0].time).toEqual(null);
                    expect(res[0].odd).toEqual("");
                    expect(res[0].manipulate).toEqual(2);
                });
        });

    });

    describe("testing num 0", () => {

        test("finding all 0 num", () => {
            expect.assertions(1);
            return DB.find({num: 0})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(1);
            });
        });

        test("finding one 0 num", () => {
            expect.assertions(1);
            return DB.find({num: 0})
            .limit(1)
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(1);
            });
        });

    });

    describe("testing num -1", () => {

        test("finding all -1 num", () => {
            expect.assertions(1);
            return DB.find({num: -1})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(1);
            });
        });

        test("finding one -1 num", () => {
            expect.assertions(1);
            return DB.find({num: -1})
            .limit(1)
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(1);
            });
        });

    });

    describe("testing time null", () => {

        test("finding all null time", () => {
            expect.assertions(1);
            return DB.find({time: null})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(2);
            });
        });

        test("finding one null time", () => {
            expect.assertions(1);
            return DB.find({time: null})
            .limit(1)
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(1);
            });
        });

    });

    describe("testing odd ''", () => {

        test("finding all '' odd", () => {
            expect.assertions(1);
            return DB.find({odd: ""})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(2);
            });
        });

        test("finding one '' odd", () => {
            expect.assertions(1);
            return DB.find({odd: ""})
            .limit(1)
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(1);
            });
        });

    });

    test("removing 2 item isSynced false", () => {
        expect.assertions(1);
        let response;
        return DB.remove({isSynced: false})
            .then((res) => {
                response = res;
                return DB.sanitize();
            })
            .then(() => {
                expect(response).toEqual(2);
            });
    });

    test("removing 1 item time null", () => {
        let response;
        return DB.remove({time: null})
            .then((res) => {
                response = res;
                return DB.sanitize();
            })
            .then(() => {
                expect(response).toEqual(1);
            });
    });

    test("clear datastore", () => {
        return store.clear()
            .then((res) => {
                const exists = fs.existsSync(`${CWD}/spec/example/db/store`);
                expect(exists).toBe(false);
            });
    });

});
