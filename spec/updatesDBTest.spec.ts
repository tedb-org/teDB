
import { Datastore } from "../src";
import { MockStorageDriver } from "./example";
import { compressObj } from "../src";
import * as fs from "fs";

describe("creating new Datastore, most update testing", () => {
    const CWD = process.cwd();
    const StateStorage = new MockStorageDriver("states");
    const States = new Datastore({storage: StateStorage});
    let unsetObj: any;
    test("creating Index", () => {
        expect.assertions(2);
        return States.ensureIndex({fieldName: "name", unique: true})
        .then(() => {
            return States.ensureIndex({fieldName: "cities.one", unique: true});
        })
        .then(() => {
            return States.getIndices();
        })
        .then((indices) => {
            expect(indices.get("name").fieldName).toEqual("name");
            expect(indices.get("cities.one").fieldName).toEqual("cities.one");
        });
    });

    test("inserting one state", () => {
        expect.assertions(4);
        return States.insert({name: "Oklahoma", population: 3.9, cities: {one: "OKC", two: "Tulsa"}})
        .then((res) => {
            expect(res.name).toEqual("Oklahoma");
            expect(res.population).toEqual(3.9);
            expect(res.cities.one).toEqual("OKC");
            expect(res.cities.two).toEqual("Tulsa");
        });
    });

    test("inserting many states", () => {
        const docs: any[] = [];
        expect.assertions(1);
        return States.insert({name: "Texas", population: 27.47, cities: {one: "Houston", two: "Dallas"}})
        .then((doc) => {
            docs.push(doc);
            return States.insert({name: "Massachusetts", population: 6.79, cities: {one: "Boston", two: "Cambridge"}});
        })
        .then((doc) => {
            docs.push(doc);
            return States.insert({name: "Washington", population: 7.17, cities: {one: "Seattle", two: "Spokane"}});
        })
        .then((doc) => {
            docs.push(doc);
            return States.insert({name: "California", population: 39.14, cities: {one: "LA", two: "Berkely"}});
        })
        .then((doc) => {
            docs.push(doc);
            expect(docs.length).toEqual(4);
        });
    });

    test("finding using nested indexed field", () => {
        expect.assertions(2);
        return States.find({"cities.one": "LA"})
        .exec()
        .then((doc) => {
            const Cali = doc[0];
            expect(Cali.name).toEqual("California");
            expect(Cali.cities.one).toEqual("LA");
        });
    });

    test("finding using nested non-indexed field", () => {
        expect.assertions(2);
        return States.find({"cities.two": "Spokane"})
        .exec()
        .then((doc) => {
            const Wash = doc[0];
            expect(Wash.name).toEqual("Washington");
            expect(Wash.cities.two).toEqual("Spokane");
        });
    });

    test("update - upsert - multi", () => {
        expect.assertions(4);
        return States.update({
                name: "South Carolina",
                population: 4.89,
                cities: {
                    one: "Charleston",
                    two: "Columbia",
                },
            }, {
                $set: {
                    population: 4.9,
                },
                $rename: {
                    population: "pop",
                },
            }, {
                multi: true,
                upsert: true,
                returnUpdatedDocs: true,
                exactObjectFind: true,
            })
            .then((res) => {
                res = res[0];
                expect(res.name).toEqual("South Carolina");
                expect(res.pop).toEqual(4.9);
                expect(res.cities.one).toEqual("Charleston");
                expect(res.cities.two).toEqual("Columbia");
            });
    });

    test("update - upsert", () => {
        expect.assertions(5);
        return States.update({
                name: "Minnesota",
                population: 5.49,
                cities: {
                    one: "St Cloud",
                    two: "Bemidji",
                },
            }, {
                $rename: {
                    population: "pop",
                },
            }, {
                upsert: true,
                returnUpdatedDocs: true,
                exactObjectFind: true,
            })
            .then((res) => {
                res = res[0];
                expect(res.name).toEqual("Minnesota");
                expect(res.pop).toEqual(5.49);
                expect(res.cities.one).toEqual("St Cloud");
                expect(res.cities.two).toEqual("Bemidji");
                return States.find({name: res.name}).exec();
            })
            .then((docs) => {
                return States.remove({_id: docs[0]._id})
                    .then((res) => {
                        expect(res).toEqual(1);
                    });
            });
    });

    test("update many nested $set $rename", () => {
        expect.assertions(1);
        return States.update({name: {$ne: "South Carolina"}}, {$set: {"cities.three": "testing"}, $rename: {population: "pop"}}, {multi: true, returnUpdatedDocs: true})
        .then((res) => {
            expect(res.length).toEqual(5);
            return res;
        })
        .then(() => {
            return States.update({name: "South Carolina"}, {$set: {"cities.three": "testing"}});
        });
    });

    test("update $inc $mul", () => {
        expect.assertions(1);
        return States.update({name: "Oklahoma"}, {$inc: {pop: -2}, $mul: {pop: 2}}, {returnUpdatedDocs: true})
        .then((res) => {
            expect(res[0].pop).toEqual(3.8);
        });
    });

    test("updating $rename, no error on $gt 0", () => {
        expect.assertions(2);
        return States.update({pop: {$gt: 0}}, {$inc: {pop: 1}}, {multi: true, returnUpdatedDocs: true})
        .then((res) => {
            const Mass = res.filter((cur) => cur.name === "Massachusetts")[0];
            expect(Mass.pop).toEqual(7.79);
            expect(res.length).toEqual(6);
        });
    });

    test("update one $unset", () => {
        expect.assertions(2);
        return States.update({}, {$unset: {"cities.three": ""}}, {returnUpdatedDocs: true})
        .then((res) => {
            unsetObj = res[0];
            expect(res.length).toEqual(1);
            expect(res[0].cities.three).toEqual(undefined);
        });
    });

    test("storing new Index", () => {
        expect.assertions(7);
        return States.saveIndex("name")
        .then(() => {
            return StateStorage.fetchIndex("name");
        })
        .then((res) => {
            const index = res;
            expect(index.length).toEqual(6);
            expect(index[0].key).toEqual("Oklahoma");
            expect(index[1].key).toEqual("Texas");
            expect(index[2].key).toEqual("Massachusetts");
            expect(index[3].key).toEqual("Washington");
            expect(index[4].key).toEqual("South Carolina");
            expect(index[5].key).toEqual("California");
        });
    });
    test("removing the persisted index & in memory", () => {
        expect.assertions(2);
        return States.removeIndex("name")
        .then(() => {
            return States.getIndices();
        })
        .then((indices) => {
            if (indices) {
                expect(indices.get("name")).toEqual(undefined);
            }
            return StateStorage.removeIndex("name");
        })
        .then(() => {
            const exists = fs.existsSync(`${CWD}/spec/example/db/states/index_name.db`);
            expect(exists).toEqual(false);
        });
    });

    test("clear the datastore states", () => {
        expect.assertions(1);
        return StateStorage.clear()
        .then(() => {
            const exists = fs.existsSync(`${CWD}/spec/example/db/states`);
            expect(exists).toBe(false);
        });
    });
});
