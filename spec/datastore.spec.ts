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
import { MockStorageDriver } from "./example";
import * as fs from "fs";
import ErrnoException = NodeJS.ErrnoException;

beforeAll(() => {
    // Clear the /spec/example/db directory and load in the fixture directory
    console.log("start");
    const cwd = process.cwd();
    const files = fs.readdirSync(`${cwd}/spec/example/db`); // rm later
    const mv = fs.readdirSync(`${cwd}/spec/fixtures/db`);
    files.map((file) => fs.unlinkSync(`${cwd}/spec/example/db/${file}`)); // rm later
    mv.map((file) => {
        const data = fs.readFileSync(`${cwd}/spec/fixtures/db/${file}`);
        fs.writeFileSync(`${cwd}/spec/example/db/${file}`, data);
    });
});

describe("testing the datastore", () => {
    const cwd = process.cwd();
    const files = fs.readdirSync(`${cwd}/spec/example/db`);
    console.log(files);

    test("stuff", () => {
        const a = new MockStorageDriver("users");
        const db = new Datastore({storage: a, generateId: true});
        const file = fs.readFileSync(`${cwd}/spec/fixtures/db/users.db`, "utf8");
        const data = file.split("\n");
        for (let i = data.length - 2; i >= 0; i--) {
            data[i] = JSON.parse(data[i]);
        }
        data.pop();
        db.ensureIndex({fieldName: "name", unique: true})
            .then((res) => {
                // console.log("successful ensure Index 1");
            })
            .catch((err) => {
                // console.log("fail ensure index 1");
            });
        db.ensureIndex({fieldName: "age", unique: true})
          .then((res) => {
              // console.log("success ensure index 2");
          })
          .catch((err) => {
              // console.log("fail ensure index 2");
          });

        for (let i = 0; i <= data.length; i++) {
            if (data[i] !== undefined) {
                db.insert(data[i])
                    .then((res) => {
                        // console.log("insert Success");
                    })
                    .catch((err) => {
                        // console.log(data[i])
                        // console.log(err);
                        // console.log("fail insert");
                    });
            }
        }
        // need to write a method to get the json for all indexed items.
        // then proceed to use the storage driver method to store each
        // JSON string into its own file.
        db.getIndices()
            .then((res) => {
                res.forEach((v, k) => {
                    const fieldName = v.fieldName;
                    v.toJSON()
                        .then((json) => {
                            return a.storeIndex(fieldName, json);
                        })
                        .then((response) => {
                            // console.log(response);
                        })
                        .catch((err) => {
                            // console.log(err);
                        });
                });
            });
        a.fetchIndex("age")
            .then((res) => {
                res.map((item) => {
                   // console.log(item);
                });
            })
            .catch((err) => {
                // console.log(err);
            });
    });

    test("hmm", () => {
        const a = new MockStorageDriver("users");
        a.clear()
         .then((res) => {
             console.log("Success");
             console.log(res);
         })
         .catch((err) => {
             console.log("error");
             console.log(err);
         });
    });
});

afterAll(() => {
    // removed all files from example/db at the end. of testing finished.
    console.log("end");
});
