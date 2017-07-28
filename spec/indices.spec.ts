import { Index, Datastore } from "../src";
import { MockStorageDriver} from "./example/exampleStorageDriver";
import * as fs from "fs";

describe("testing indices storage and fetching functionality", () => {
    const CWD = process.cwd();
    const nonUIndexStorage = new MockStorageDriver("nonUIndexTests");
    const nonUIndexStore = new Datastore({storage: nonUIndexStorage});
    const UIndexStorage = new MockStorageDriver("UIndexTests");
    const UIndexStore = new Datastore({storage: UIndexStorage});
    const uniqDocs = [
        {type: 0},
        {type: 1},
        {type: 2},
    ];
    const nonUniqDocs = [
        {type: 0, t: 0},
        {type: 0, t: 1},
        {type: 1, t: 2},
        {type: 1, t: 3},
    ];

    let objNonUIndexTests: any[];
    let objUIndexTests: any[];

    test("ensuring index", () => {
        expect.assertions(2);
        return nonUIndexStore.ensureIndex({fieldName: "type", unique: false})
            .then((res) => {
                const promises: Array<Promise<any>> = [];
                nonUniqDocs.forEach((doc) => promises.push(nonUIndexStore.insert(doc)));
                return Promise.all(promises);
            })
            .then((res) => {
                expect(res.length).toEqual(4);
                return UIndexStore.ensureIndex({fieldName: "type", unique: true});
            })
            .then((res) => {
                const promises: Array<Promise<any>> = [];
                uniqDocs.forEach((doc) => promises.push(UIndexStore.insert(doc)));
                return Promise.all(promises);
            })
            .then((res) => {
                expect(res.length).toEqual(3);
            });
    });

    test("saving indices", () => {
        expect.assertions(12);
        return nonUIndexStore.getIndices()
            .then((res) => {
                const promises: Array<Promise<null>> = [];
                res.forEach((v: Index, k: string) => promises.push(nonUIndexStore.saveIndex(k)));
                return Promise.all(promises);
            })
            .then(() => {
                return nonUIndexStorage.fetchIndex("type");
            })
            .then((res) => {
                objNonUIndexTests = res;
                expect(res.length).toEqual(2);
                expect(res[0].key).toEqual(0);
                expect(res[0].value.length).toEqual(2);
                expect(res[1].key).toEqual(1);
                expect(res[1].value.length).toEqual(2);
                return UIndexStore.getIndices();
            })
            .then((res) => {
                const promises: Array<Promise<null>> = [];
                res.forEach((v: Index, k: string) => promises.push(UIndexStore.saveIndex(k)));
                return Promise.all(promises);
            })
            .then(() => {
                return UIndexStorage.fetchIndex("type");
            })
            .then((res) => {
                objUIndexTests = res;
                expect(res.length).toEqual(3);
                expect(res[0].key).toEqual(1);
                expect(res[1].key).toEqual(2);
                expect(res[2].key).toEqual(0);
                expect(res[0].value.length).toEqual(1);
                expect(res[1].value.length).toEqual(1);
                expect(res[2].value.length).toEqual(1);
            });
    });

    test("removing all indices", () => {
        expect.assertions(2);
        const promises: Array<Promise<any>> = [];
        uniqDocs.forEach((doc) => promises.push(UIndexStore.remove({type: doc.type})));
        return Promise.all(promises)
            .then((res) => {
                expect(res).toEqual(expect.arrayContaining([1, 1, 1]));
                const NonPromises: Array<Promise<any>> = [];
                NonPromises.push(nonUIndexStore.remove({type: 0}));
                NonPromises.push(nonUIndexStore.remove({type: 1}));

                return Promise.all(NonPromises);
            })
            .then((res) => {
                expect(res).toEqual(expect.arrayContaining([2, 2]));
            });
    });

    test("loading indices back into database", () => {
        expect.assertions(12);
        return nonUIndexStorage.fetchIndex("type")
            .then((res) => {
                return nonUIndexStore.insertIndex("type", res);
            })
            .then(() => {
                return nonUIndexStore.getIndices();
            })
            .then((res) => {
                const ind: Index = res.get("type");
                if (ind) {
                    return ind.toJSON();
                }
            })
            .then((res) => {
                const rezult: any = JSON.parse(res);
                expect(rezult.length).toEqual(2);
                expect(rezult[0].key).toEqual(0);
                expect(rezult[0].value.length).toEqual(2);
                expect(rezult[1].key).toEqual(1);
                expect(rezult[1].value.length).toEqual(2);
                return UIndexStorage.fetchIndex("type");
            })
            .then((res) => {
                return UIndexStore.insertIndex("type", res);
            })
            .then(() => {
                return UIndexStore.getIndices();
            })
            .then((res) => {
                const ind: Index = res.get("type");
                if (ind) {
                    return ind.toJSON();
                }
            })
            .then((res) => {
                    const rezult: any = JSON.parse(res);
                    expect(rezult.length).toEqual(3);
                    expect(rezult[0].key).toEqual(1);
                    expect(rezult[0].value.length).toEqual(1);
                    expect(rezult[1].key).toEqual(2);
                    expect(rezult[1].value.length).toEqual(1);
                    expect(rezult[2].key).toEqual(0);
                    expect(rezult[2].value.length).toEqual(1);
            });
    });

    test("clearing", () => {
        expect.assertions(2);
        return nonUIndexStorage.clear()
            .then(() => {
                const exists = fs.existsSync(`${CWD}/spec/example/db/nonUIndexTests`);
                expect(exists).toBe(false);
                return UIndexStorage.clear();
            })
            .then(() => {
                const exists = fs.existsSync(`${CWD}/spec/example/db/UIndexTests`);
                expect(exists).toBe(false);
            });
    });

});
