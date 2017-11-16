/**
 * This test file will use the MockStorageDriver from
 * /teDB/spec/example/exampleStorageDriver.ts. Originally
 * the /spec/example/db directory is empty, but will be loaded
 * with the /spec/fixtures/db directory at start. After this
 * loading a database will write or read to /spec/example/db.
 *
 *    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 *  Very specific tests here. To start it. Un-uncomment the
 *  beforeAll and the test("clear"). Run the test. All should
 *  pass.
 *
 *  Then Comment out the test("clear") at the bottom, run
 *  tests, all should pass
 *
 *  Then Comment out the inside of the beforeAll. Run tests
 *  and all should pass.
 *
 *  Finally run the tests in this state one or two times more
 *  the tests should all still pass.
 *
 *    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */

import { Index, Datastore } from "../../src";
import { getDate } from "../../src/utils";
import { MockStorageDriver } from "../example";
import * as fs from "fs";

beforeAll(() => {
    const cwd = process.cwd();
    const datastores = fs.readdirSync(`${cwd}/spec/fixtures/db/users`);
    if (!fs.existsSync(`${cwd}/spec/example/db/users`)) {
        fs.mkdirSync(`${cwd}/spec/example/db/users`);
    }
    datastores.map((file) => {
        const data = fs.readFileSync(`${cwd}/spec/fixtures/db/users/${file}`);
        fs.writeFileSync(`${cwd}/spec/example/db/users/${file}`, data);
    });
});

describe("testing the datastore, testing loading in and querying persisted data", () => {
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

    test("update all", () => {
        return Users.update({}, {
                $set: {
                    isSynced: false,
                },
            }, {returnUpdatedDocs: true, multi: true})
            .then((res) => {
                expect(res.length > 8).toEqual(true);
            });
    });

    test("upserting a test user to update", () => {
        expect.assertions(4);
        return Users.update({
                name: "tester",
                age: 100,
                isSynced: false,
            }, {
                $set: {
                    isSynced: true,
                },
            }, {
                upsert: true,
                returnUpdatedDocs: true,
                exactObjectFind: true,
            })
            .then((res) => {
                expect(res[0].name).toEqual("tester");
                expect(res[0].age).toEqual(100);
                expect(res[0].isSynced).toEqual(true);
                return Users.getIndices();
            })
            .then((indices) => {
                const promises: Array<Promise<null>> = [];
                indices.forEach((v: Index, k: string) => {
                    promises.push(Users.saveIndex(k));
                });
                return Promise.all(promises);
            })
            .then(() => {
                return UserStorage.fetchIndex("name");
            })
            .then((res) => {
                expect(res.length).toEqual(11);
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
        expect.assertions(2);
        return Users.remove({name: "Joshua"})
        .then((res) => {
            expect(res).toBe(1);
            return Users.sanitize();
        })
        .then(() => Users.getIndices())
        .then((indices) => {
            const promises: Array<Promise<null>> = [];
            indices.forEach((v: Index, k: string) => {
                promises.push(Users.saveIndex(k));
            });
            return Promise.all(promises);
        })
        .then(() => {
            return UserStorage.fetchIndex("name");
        })
        .then((res) => {
            expect(res.length).toEqual(10);
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

    test("finding all users", () => {
        expect.assertions(1);
        return Users.find()
        .exec()
        .then((res) => {
            res = res as any[];
            expect(res.length).toEqual(10);
        });
    });

    test("finding $or", () => {
        expect.assertions(2);
        return Users.find({$or: [{name: "Marcus"}, {name: "Gavin"}]})
        .exec()
        .then((res) => {
            res = res as any[];
            expect(res.length).toEqual(2);
            expect(res).toEqual((expect.arrayContaining([{ _id: "T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", name: "Marcus", age: 0, friends: [ "UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9", "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9" ], isSynced: false }, { _id: "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9", name: "Gavin", age: 25, friends: [ "T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", "UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9"], isSynced: false}])));
        });
    });

    test("nested $and searches", () => {
        expect.assertions(1);
        return Users.find({$and: [{age: {$gt: 25}}, {age: {$ne: 28}}, {age: {$lte: 35}}]})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(3);
            });
    });

    test("finding $and", () => {
        expect.assertions(2);
        return Users.find({$and: [{name: "Gavin"}, {age: 25}]})
        .exec()
        .then((res) => {
            res = res as any[];
            expect(res.length).toEqual(1);
            expect(res).toEqual(expect.arrayContaining([{_id: "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9", age: 25, friends: ["T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", "UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9"], isSynced: false, name: "Gavin"}]));
        });
    });

    test("finding one user by ID", () => {
        expect.assertions(1);
        return Users.find({_id: "T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9"})
        .exec()
        .then((res) => {
            expect(res).toEqual(expect.arrayContaining([{_id: "T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", age: 0, friends: ["UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9", "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9"], isSynced: false, name: "Marcus"}]));
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
            expect(res).toEqual(expect.arrayContaining([{_id: "UGVUQVJWd0JBQUE9R2JkWG9UUlErcDg9cUdSOU5CMnNwR0U9ZmpkUzVuZmhIWE09", age: 39, friends: ["UHVUQVJWd0JBQUE9ZkZTNFRzQ0YwRVE9QTBRaUpUWjFJQ0U9UlRsNVg3MHNPcFE9", "UCtUQVJWd0JBQUE9TVMrYjRpWVUrTEk9cWpON01RWGlQWjA9c1NWQzBacFNqakE9"], isSynced: false, name: "Scott"}, {_id: "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9", age: 25, friends: ["T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", "UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9"], isSynced: false, name: "Gavin"}]));
            expect(res.length).toEqual(2);
        });
    });

    test("finding with $created_at", () => {
        expect.assertions(8);
        return Users.find({})
            .limit(3)
            .sort({$created_at: -1})
            .exec()
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(3);
                expect(res[0].name).toEqual("Gavin");
                expect(res[1].name).toEqual("Scott");
                expect(res[2].name).toEqual("Marcus");
                return Users.find({})
                    .limit(3)
                    .sort({$created_at: 1})
                    .exec();
            })
            .then((res) => {
                res = res as any[];
                expect(res.length).toEqual(3);
                expect(res[0].name).toEqual("Marcus");
                expect(res[1].name).toEqual("Scott");
                expect(res[2].name).toEqual("Gavin");
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
            expect(res).toEqual(expect.arrayContaining([ { _id: "UHVUQVJWd0JBQUE9TVJpdzRYUUtZMGc9Wk1tM0Rla0hvem89UXBXaTRETjgxVHc9", name: "Gavin", age: 25, friends: [ "T2VUQVJWd0JBQUE9VTNrcTlIMSt4Qjg9R0RvWVl2SkhXMmc9TkUzZlF6a2ZxaDA9", "UHVUQVJWd0JBQUE9QVlxckkraExMWUU9VkxGZjUyZi9OMmc9S0NFVy85bHlnMHM9" ], isSynced: false}, { _id: "UCtUQVJWd0JBQUE9dnVrRm1xWmJDVTQ9aGR2VjN0Z1gvK009dVpUVzMrY3N4eDg9", name: "Morgan", age: 26, friends: [ "UE9UQVJWd0JBQUE9cmZ4Y2MxVzNlOFk9TXV4dmJ0WU5JUFk9d0FkMW1oSHY2SWs9", "UCtUQVJWd0JBQUE9cHE1SmpnSE44eDQ9Rko2RmlJeHJrR1E9ZkN4cjROblB1WEU9"], isSynced: false}]));
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
