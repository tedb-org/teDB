/*

// !! ONLY RUN IF FOR TIME TESTING !!

import { Index, Datastore } from "../../src";
import { MockStorageDriver } from "../example";
import * as fs from "fs";
import * as BTT from "binary-type-tree";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000000;
describe("testing large scale", () => {
    const CWD = process.cwd();
    const store = new MockStorageDriver("large");
    const db = new Datastore({storage: store});
    //                             100,000
    const nums = BTT.getRandomArray(100000);
    const strs = nums.map((n) => n.toString());
    const docs = [];
    nums.forEach((n, i) => {
        docs.push({nums: n, Us: strs[i], Ns: strs[i], u: 1});
    });
    const docs1 = docs.splice(0, 10000);
    const docs2 = docs.splice(0, 10000);
    const docs3 = docs.splice(0, 10000);
    const docs4 = docs.splice(0, 10000);
    const docs5 = docs.splice(0, 10000);
    const docs6 = docs.splice(0, 10000);
    const docs7 = docs.splice(0, 10000);
    const docs8 = docs.splice(0, 10000);
    const docs9 = docs.splice(0, 10000);
    const docs10 = docs.splice(0, 10000);

    // To test non indexed speeds comment out this describe
    describe("testing uniq and regular index DB", () => {
        test("ensuring index", () => {
            expect.assertions(2);
            return db.ensureIndex({fieldName: "Us", unique: true})
                .then(() => {
                    return db.ensureIndex({fieldName: "Ns"});
                })
                .then(() => {
                    return db.getIndices();
                })
                .then((res) => {
                    res.forEach((v: Index, k: string) => {
                        expect(v).toBeInstanceOf(Index);
                    });
                });
        });

    });

    describe("inserting", () => {
        const s1 = new Date().getTime();
        test("1", () => {
            expect.assertions(1);
            const promises: Array<Promise<any>> = [];
            docs1.forEach((doc) => promises.push(db.insert(doc)));
            return Promise.all(promises)
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                res = res as any[];
                expect(res.length).toEqual(10000);
            });
        });

        test("2", () => {
            expect.assertions(1);
            const p: Array<Promise<any>> = [];
            docs2.forEach((doc) => p.push(db.insert(doc)));
            return Promise.all(p)
                .then((res) => {
                    res = res as any[];
                    expect(res.length).toEqual(10000);
                });
        });

        test("3", () => {
            expect.assertions(1);
            const p: Array<Promise<any>> = [];
            docs3.forEach((doc) => p.push(db.insert(doc)));
            return Promise.all(p)
                .then((res) => {
                    res = res as any[];
                    expect(res.length).toEqual(10000);
                });
        });

        test("4", () => {
            expect.assertions(1);
            const p: Array<Promise<any>> = [];
            docs4.forEach((doc) => p.push(db.insert(doc)));
            return Promise.all(p)
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(10000);
            });
        });

        test("5", () => {
            expect.assertions(1);
            const p: Array<Promise<any>> = [];
            docs5.forEach((doc) => p.push(db.insert(doc)));
            return Promise.all(p)
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(10000);
            });
        });

        test("6", () => {
            expect.assertions(1);
            const p: Array<Promise<any>> = [];
            docs6.forEach((doc) => p.push(db.insert(doc)));
            return Promise.all(p)
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(10000);
            });
        });

        test("7", () => {
            expect.assertions(1);
            const p: Array<Promise<any>> = [];
            docs7.forEach((doc) => p.push(db.insert(doc)));
            return Promise.all(p)
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(10000);
            });
        });

        test("8", () => {
            expect.assertions(1);
            const p: Array<Promise<any>> = [];
            docs8.forEach((doc) => p.push(db.insert(doc)));
            return Promise.all(p)
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(10000);
            });
        });

        test("9", () => {
            expect.assertions(1);
            const p: Array<Promise<any>> = [];
            docs9.forEach((doc) => p.push(db.insert(doc)));
            return Promise.all(p)
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(10000);
            });
        });

        test("10", () => {
            expect.assertions(1);
            const p: Array<Promise<any>> = [];
            docs10.forEach((doc) => p.push(db.insert(doc)));
            return Promise.all(p)
            .then((res) => {
                const e2 = new Date().getTime();
                const total = e2 - s1;
                console.log(total);
                res = res as any[];
                expect(res.length).toEqual(10000);
            });
        });

    });

    describe("finding", () => {
        test("finding worst case uniq, 1", () => {
            expect.assertions(1);
            const s1 = new Date().getTime();
            return db.find({Us: "1"})
            .exec()
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                res = res as any[];
                console.log(res);
                expect(res.length).toEqual(1);
            });
        });

        test("finding best case uniq, 50,000", () => {
            expect.assertions(1);
            const s1 = new Date().getTime();
            return db.find({Us: "50000"})
            .exec()
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                res = res as any[];
                console.log(res);
                expect(res.length).toEqual(1);
            });
        });

        test("finding worst case non uniq, 1", () => {
            expect.assertions(1);
            const s1 = new Date().getTime();
            return db.find({Ns: "2"})
            .exec()
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                res = res as any[];
                console.log(res);
                expect(res.length).toEqual(1);
            });
        });

        test("finding best case non uniq, 50,000", () => {
            expect.assertions(1);
            const s1 = new Date().getTime();
            return db.find({Ns: "50001"})
            .exec()
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                res = res as any[];
                console.log(res);
                expect(res.length).toEqual(1);
            });
        });
    });

    describe("updating", () => {
        test("updating worst case uniq, 1", () => {
            expect.assertions(2);
            const s1 = new Date().getTime();
            return db.update({Us: "1"}, {
                $set: {u: 3},
                $inc: {u: 1},
                $mul: {u: 2},
            }, {
                multi: false,
                returnUpdatedDocs: true,
            })
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                res = res as any[];
                console.log(res);
                expect(res.length).toEqual(1);
                expect(res[0].u).toEqual(8);
            });
        });

        test("updating best case uniq, 50,000", () => {
            expect.assertions(2);
            const s1 = new Date().getTime();
            return db.update({Us: "50000"}, {
                $set: {u: 3},
                $inc: {u: 1},
                $mul: {u: 2},
            }, {
                multi: false,
                returnUpdatedDocs: true,
            })
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                res = res as any[];
                console.log(res);
                expect(res.length).toEqual(1);
                expect(res[0].u).toEqual(8);
            });
        });

        test("updating worst case non uniq, 1", () => {
            expect.assertions(2);
            const s1 = new Date().getTime();
            return db.update({Ns: "2"}, {
                $set: {u: 3},
                $inc: {u: 1},
                $mul: {u: 2},
            }, {
                multi: false,
                returnUpdatedDocs: true,
            })
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                res = res as any[];
                console.log(res);
                expect(res.length).toEqual(1);
                expect(res[0].u).toEqual(8);
            });
        });

        test("updating best case non uniq, 50,000", () => {
            expect.assertions(2);
            const s1 = new Date().getTime();
            return db.update({Ns: "50001"}, {
                $set: {u: 3},
                $inc: {u: 1},
                $mul: {u: 2},
            }, {
                multi: false,
                returnUpdatedDocs: true,
            })
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                res = res as any[];
                console.log(res);
                expect(res.length).toEqual(1);
                expect(res[0].u).toEqual(8);
            });
        });
    });

    describe("removing", () => {
        test("removing worst case uniq, 1", () => {
            expect.assertions(1);
            const s1 = new Date().getTime();
            return db.remove({Us: "3"})
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                expect(res).toEqual(1);
            });
        });

        test("removing best case uniq, 50,000", () => {
            expect.assertions(1);
            const s1 = new Date().getTime();
            return db.remove({Us: "50003"})
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                expect(res).toEqual(1);
            });
        });

        test("removing worst case non uniq, 2", () => {
            expect.assertions(1);
            const s1 = new Date().getTime();
            return db.remove({Ns: "1"})
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                expect(res).toEqual(1);
            });
        });

        test("removing best case non uniq, 50,001", () => {
            expect.assertions(1);
            const s1 = new Date().getTime();
            return db.remove({Ns: "50000"})
            .then((res) => {
                const e1 = new Date().getTime();
                const t1 = e1 - s1;
                console.log(t1);
                expect(res).toEqual(1);
            });
        });
    });

    test("clear", () => {
        return store.clear()
            .then((res) => {
                const exists = fs.existsSync(`${CWD}/spec/example/db/large`);
                expect(exists).toEqual(false);
            });
    });
});
*/
