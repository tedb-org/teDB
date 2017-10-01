import { Index, Datastore } from "../../src";
import { MockStorageDriver } from "../example";
import * as fs from "fs";

beforeAll(() => {
    const cwd = process.cwd();
    const datastore = fs.readdirSync(`${cwd}/spec/fixtures/db/syncs`);
    if (!fs.existsSync(`${cwd}/spec/example/db/syncs`)) {
        fs.mkdirSync(`${cwd}/spec/example/db/syncs`);
    }
    datastore.map((file) => {
        const data = fs.readFileSync(`${cwd}/spec/fixtures/db/syncs/${file}`);
        fs.writeFileSync(`${cwd}/spec/example/db/syncs/${file}`, data);
    });
});

describe("testing non-index already saved db", () => {
    const CWD = process.cwd();
    const syncsStorage = new MockStorageDriver("syncs");
    const Syncs = new Datastore(({storage: syncsStorage}));

    test("finding single item from db", () => {
        expect.assertions(2);
        return Syncs.find({})
            .exec()
            .then((res) => {
                const sync = res[0];
                expect(sync.date).toEqual("2017-09-30T00:16:05.311Z");
                expect(sync._id).toEqual("QW41TXpsNEJBQUE9VDEvbTNDc0M4aDA9eUlxU283ZlQ0aVE9MTBvWXNaUVh4eXc9");
            });
    });

    test("clear the datastore syncs", () => {
        expect.assertions(1);
        return syncsStorage.clear()
            .then(() => {
                const exists = fs.existsSync(`${CWD}/spec/example/db/syncs`);
                expect(exists).toBe(false);
            });
    });
});
