/**
 * This test file will use the MockStorageDriver from
 * /teDB/spec/example/exampleStorageDriver.ts. Originally
 * the /spec/example/db directory is empty, but will be loaded
 * with the /spec/fixtures/db directory at start. After this
 * loading a database will write or read to /spec/example/db.
 *
 *
 */

import { Index, IIndex, Datastore, IDatastore, Cursor,
    IStorageDriver, IRange } from "../src";
import { getDate } from "../src/utlis";
import { MockStorageDriver } from "./example";
import * as fs from "fs";
import ErrnoException = NodeJS.ErrnoException;

beforeAll(() => {
    const cwd = process.cwd();
    const db = fs.readdirSync(`${cwd}/spec/fixtures/db`);
    const oldDB = fs.readdirSync(`${cwd}/spec/example/db`);
    oldDB.map((dir) => {
        const datastore = fs.readdirSync(`${cwd}/spec/example/db/${dir}`);
        datastore.map((file) => {
            fs.unlinkSync(`${cwd}/spec/example/db/${dir}/${file}`);
        });
    });
    db.map((dir) => {
        const datastores = fs.readdirSync(`${cwd}/spec/fixtures/db/${dir}`);
        if (!fs.existsSync(`${cwd}/spec/example/db/${dir}`)) {
            fs.mkdirSync(`${cwd}/spec/example/db/${dir}`);
        }
        datastores.map((file) => {
            const data = fs.readFileSync(`${cwd}/spec/fixtures/db/${dir}/${file}`);
            fs.writeFileSync(`${cwd}/spec/example/db/${dir}/${file}`, data);
        });
    });
});
describe("testing the datastore", () => {

    describe("testing loading in and querying persisted data", () => {
        // loads initial users db
        const CWD = process.cwd();
        const UserStorage = new MockStorageDriver("users");
        const Users = new Datastore({storage: UserStorage});

        test("loading users name index into the datastore from disk", () => {
            expect.assertions(1);
            let index: any[];
            return UserStorage.fetchIndex("name")
            .then((indexArray) => {
                index = indexArray;
                return Users.ensureIndex({fieldName: "name", unique: true});
            })
            .then(() => {
                return Users.insertIndex("name", index);
            })
            .then(() => {
                return Users.getIndices();
            })
            .then((indices) => {
                const ind: Index = indices.get("name");
                if (ind) {
                    return ind.toJSON();
                } else {
                    throw new Error("No index for name");
                }
            })
            .then((res) => {
                const nameJSON: string = JSON.parse(res);
                expect(nameJSON).toEqual(expect.arrayContaining([{ key: "Marcus", value: ["T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9"]}, { key: "Scott", value: ["UGVUQVJWd0JBQUE9R2JkWG9UUlErcDg9cUdSOU5CMnNwR0U9ZmpkUzVuZmhIWE09"]}, { key: "Gavin", value: ["UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9"]}, { key: "Smith", value: ["UCtUQVJWd0JBQUE9cHE1SmpnSE44eDQ9Rko2RmlJeHJrR1E9ZkN4cjROblB1WEU9"]}, { key: "Kevin", value: ["UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9"]}, { key: "Mark", value: ["UHVUQVJWd0JBQUE9ZkZTNFRzQ0YwRVE9QTBRaUpUWjFJQ0U9UlRsNVg3MHNPcFE9"]}, { key: "Francis", value: ["UE9UQVJWd0JBQUE9cmZ4Y2MxVzNlOFk9TXV4dmJ0WU5JUFk9d0FkMW1oSHY2SWs9"]}, { key: "Luke", value: ["UCtUQVJWd0JBQUE9TVMrYjRpWVUrTEk9cWpON01RWGlQWjA9c1NWQzBacFNqakE9"]}, { key: "Morgan", value: ["UCtUQVJWd0JBQUE9dnVrRm1xWmJDVTQ9aGR2VjN0Z1gvK009dVpUVzMrY3N4eDg9"]}]));
            });
        });

        test("loading users age index into the datastore from disk", () => {
            expect.assertions(1);
            let index: any[]; // will hold the array of objects of indices
            return UserStorage.fetchIndex("age")
            .then((indexArray) => {
                index = indexArray;
                return Users.ensureIndex({fieldName: "age", unique: true});
            })
            .then(() => {
                return Users.insertIndex("age", index);
            })
            .then(() => {
                return Users.getIndices();
            })
            .then((indices) => {
                const ind: Index = indices.get("age");
                if (ind) {
                    return ind.toJSON();
                } else {
                    throw new Error("No index for age");
                }
            })
            .then((res) => {
                const ageJSON: string = JSON.parse(res);
                expect(ageJSON).toEqual(expect.arrayContaining([{ key: 27, value: ["UHVUQVJWd0JBQUE9ZkZTNFRzQ0YwRVE9QTBRaUpUWjFJQ0U9UlRsNVg3MHNPcFE9"]}, { key: 35, value: ["UCtUQVJWd0JBQUE9cHE1SmpnSE44eDQ9Rko2RmlJeHJrR1E9ZkN4cjROblB1WEU9"]}, { key: 22, value: ["UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9"]}, { key: 39, value: ["UGVUQVJWd0JBQUE9R2JkWG9UUlErcDg9cUdSOU5CMnNwR0U9ZmpkUzVuZmhIWE09"]}, { key: 25, value: ["UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9"]}, { key: 28, value: ["UE9UQVJWd0JBQUE9cmZ4Y2MxVzNlOFk9TXV4dmJ0WU5JUFk9d0FkMW1oSHY2SWs9"]}, { key: 0, value: ["T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9"]}, { key: 26, value: ["UCtUQVJWd0JBQUE9dnVrRm1xWmJDVTQ9aGR2VjN0Z1gvK009dVpUVzMrY3N4eDg9"]}, { key: 1, value: ["UCtUQVJWd0JBQUE9TVMrYjRpWVUrTEk9cWpON01RWGlQWjA9c1NWQzBacFNqakE9"]}]));
            });
        });

        test("getting a user object and a friend", () => {
            expect.assertions(6);
            return Users.getIndices()
            .then((indices) => {
                const IndexName = indices.get("name");
                if (IndexName) {
                    return IndexName.search("Scott");
                } else {
                    throw new Error("No Index for name");
                }
            })
            .then((id) => {
                return UserStorage.getItem(id[0]);
            })
            .then((user) => {
                expect(user.name).toEqual("Scott");
                expect(user.age).toEqual(39);
                expect(user.friends).toEqual(expect.arrayContaining(["UHVUQVJWd0JBQUE9ZkZTNFRzQ0YwRVE9QTBRaUpUWjFJQ0U9UlRsNVg3MHNPcFE9", "UCtUQVJWd0JBQUE9TVMrYjRpWVUrTEk9cWpON01RWGlQWjA9c1NWQzBacFNqakE9"]));
                return UserStorage.getItem(user.friends[0]);
            })
            .then((user) => {
                expect(user.name).toEqual("Mark");
                expect(user.age).toEqual(27);
                expect(user.friends).toEqual(expect.arrayContaining(["UCtUQVJWd0JBQUE9TVMrYjRpWVUrTEk9cWpON01RWGlQWjA9c1NWQzBacFNqakE9", "UGVUQVJWd0JBQUE9R2JkWG9UUlErcDg9cUdSOU5CMnNwR0U9ZmpkUzVuZmhIWE09"]));
            });
        });

        test("retrieving generated _id Date of user", () => {
            expect.assertions(2);
            return Users.find({ name: "Francis"})
            .exec()
            .then((res) => {
                const idDate = getDate(res[0]._id);
                expect(idDate).toBeInstanceOf(Date);
                expect(idDate).toEqual(new Date("2017-05-26T17:14:48.252Z"));
            });
        });

        test("inserting a new user", () => {
            expect.assertions(2);
            return Users.insert({ name: "Joshua", age: 49})
            .then((res) => {
                expect(res.name).toEqual("Joshua");
                expect(res.age).toEqual(49);
            });
        });

        test("finding a user", () => {
            expect.assertions(2);
            return Users.find({name: "Joshua"})
            .exec()
            .then((res) => {
                const joshua = res[0];
                expect(joshua.name).toEqual("Joshua");
                expect(joshua.age).toEqual(49);
            });
        });

        test("removing a user", () => {
            expect.assertions(1);
            return Users.remove({name: "Joshua"})
            .then((res) => {
                expect(res).toBe(1);
            });
        });

        test("finding all users", () => {
            expect.assertions(1);
            return Users.find()
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(9);
            });
        });

        test("finding all users age 22-28", () => {
            expect.assertions(1);
            return Users.find({age: {$gte: 22, $lte: 28}})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(5);
            });
        });

        test("finding $or", () => {
            expect.assertions(2);
            return Users.find({$or: [{name: "Marcus"}, {name: "Gavin"}]})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(2);
                expect(res).toEqual((expect.arrayContaining([{ _id: "T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", name: "Marcus", age: 0, friends: [ "UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9", "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9" ] }, { _id: "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9", name: "Gavin", age: 25, friends: [ "T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", "UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9"]}])));
            });
        });

        test("finding $and", () => {
            expect.assertions(2);
            return Users.find({$and: [{name: "Gavin"}, {age: 25}]})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(1);
                expect(res).toEqual(expect.arrayContaining([{_id: "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9", age: 25, friends: ["T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", "UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9"], name: "Gavin"}]));
            });
        });

        test("finding one user by ID", () => {
            expect.assertions(1);
            return Users.find({_id: "T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9"})
            .exec()
            .then((res) => {
                expect(res).toEqual(expect.arrayContaining([{_id: "T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", age: 0, friends: ["UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9", "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9"], name: "Marcus"}]));
            });
        });

        test("the cursor no index", () => {
            expect.assertions(2);
            return Users.find({})
            .sort({age: -1})
            .skip(1)
            .limit(2)
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res).toEqual(expect.arrayContaining([{_id: "UGVUQVJWd0JBQUE9R2JkWG9UUlErcDg9cUdSOU5CMnNwR0U9ZmpkUzVuZmhIWE09", age: 39, friends: ["UHVUQVJWd0JBQUE9ZkZTNFRzQ0YwRVE9QTBRaUpUWjFJQ0U9UlRsNVg3MHNPcFE9", "UCtUQVJWd0JBQUE9TVMrYjRpWVUrTEk9cWpON01RWGlQWjA9c1NWQzBacFNqakE9"], name: "Scott"}, {_id: "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9", age: 25, friends: ["T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", "UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9"], name: "Gavin"}]));
                expect(res.length).toEqual(2);
            });
        });

        test("the cursor with index", () => {
            expect.assertions(2);
            return Users.find({age: {$gt: 1}})
            .sort({age: 1})
            .skip(1)
            .limit(2)
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res).toEqual(expect.arrayContaining([ { _id: "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9", name: "Gavin", age: 25, friends: [ "T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", "UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9" ] }, { _id: "UCtUQVJWd0JBQUE9dnVrRm1xWmJDVTQ9aGR2VjN0Z1gvK009dVpUVzMrY3N4eDg9", name: "Morgan", age: 26, friends: [ "UE9UQVJWd0JBQUE9cmZ4Y2MxVzNlOFk9TXV4dmJ0WU5JUFk9d0FkMW1oSHY2SWs9", "UCtUQVJWd0JBQUE9cHE1SmpnSE44eDQ9Rko2RmlJeHJrR1E9ZkN4cjROblB1WEU9"]}]));
                expect(res.length).toEqual(2);
            });
        });

        test("clear the datastore users", () => {
            expect.assertions(1);
            return UserStorage.clear()
            .then(() => {
                const exists = fs.existsSync(`${CWD}/spec/example/db/users`);
                expect(exists).toBe(false);
            });
        });
    });

    describe("creating new datastore", () => {
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
            return States.update({name: "South Carolina", population: 4.89, cities: {one: "Charleston", two: "Columbia"}}, {$set: {population: 4.9}, $rename: {population: "pop"}}, {multi: true, upsert: true, returnUpdatedDocs: true})
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
            return States.update({name: "Minnesota", population: 5.49, cities: {one: "St Cloud", two: "Bemidji"}}, {$rename: {population: "pop"}}, {upsert: true, returnUpdatedDocs: true})
            .then((res) => {
                res = res[0];
                expect(res.name).toEqual("Minnesota");
                expect(res.pop).toEqual(5.49);
                expect(res.cities.one).toEqual("St Cloud");
                expect(res.cities.two).toEqual("Bemidji");
                return res;
            })
            .then((doc) => {
                return States.remove(doc)
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
                    res = res as any[];
                    expect(res.length).toEqual(6);
                    expect(res[0].key).toEqual("Oklahoma");
                    expect(res[1].key).toEqual("Texas");
                    expect(res[2].key).toEqual("Massachusetts");
                    expect(res[3].key).toEqual("Washington");
                    expect(res[4].key).toEqual("South Carolina");
                    expect(res[5].key).toEqual("California");
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
});
