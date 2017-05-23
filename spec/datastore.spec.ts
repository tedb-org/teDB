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

beforeAll(() => {
    // Clear the /spec/example/db directory and load in the fixture directory
    console.log("start");
});

describe("testing the datastore", () => {

    test("something", () => {
        const a = new MockStorageDriver();

        a.setItem("a", 4)
            .then((res) => {
                console.log(res);
            });

    });

});

afterAll(() => {
    console.log("end");
});
