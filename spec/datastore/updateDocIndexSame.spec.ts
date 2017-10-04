
import { Index, Datastore } from "../../src";
import { MockStorageDriver } from "../example";
import * as fs from "fs";

beforeAll(() => {
    const cwd = process.cwd();
    const datastores = fs.readdirSync(`${cwd}/spec/fixtures/db/orderIds`);
    if (!fs.existsSync(`${cwd}/spec/example/db/orderIds`)) {
        fs.mkdirSync(`${cwd}/spec/example/db/orderIds`);
    }
    datastores.forEach((file) => {
        const data = fs.readFileSync(`${cwd}/spec/fixtures/db/orderIds/${file}`);
        fs.writeFileSync(`${cwd}/spec/example/db/orderIds/${file}`, data);
    });
});

describe("testing edit of indexed keys", () => {
    const CWD = process.cwd();
    const orderStorage = new MockStorageDriver("orderIds");
    const OrderIds = new Datastore({storage: orderStorage});
    let id: string;

    test("loading orderIds index into datastore from disk", () => {
        expect.assertions(1);
        let index: any[];
        return orderStorage.fetchIndex("orderId")
            .then((indexArray) => {
                index = indexArray;
                return OrderIds.ensureIndex({fieldName: "orderId", unique: false});
            })
            .then(() => {
                return OrderIds.insertIndex("orderId", index);
            })
            .then(() => {
                return OrderIds.getIndices();
            })
            .then((indices) => {
                const ind: Index = indices.get("orderId");
                if (ind) {
                    return ind.toJSON();
                }
            })
            .then((res) => {
                const json: any = JSON.parse(res);
                id = json[0].key;
                expect(json).toEqual(expect.arrayContaining([{ key: "c08xcjZGNEJBQUE9aFVFTTdSTk5UTzA9cks1Zkpteld4TjQ9MmZmZDJBak0wNkU9", value: ["c08xcjZGNEJBQUE9aFVFTTdSTk5UTzA9cks1Zkpteld4TjQ9MmZmZDJBak0wNkU9"]}]));
            });
    });

    test("$set same key", () => {
        expect.assertions(1);
        return OrderIds.update({
                orderId: id,
            }, {
                $set: {
                    orderId: id,
                },
            }, {
                returnUpdatedDocs: true,
            })
            .then((res) => {
                expect(res[0].orderId).toEqual(id);
            });
    });

    test("index still exists", () => {
        expect.assertions(1);
        return OrderIds.getIndices()
            .then((indices) => {
                const ind: Index = indices.get("orderId");
                if (ind) {
                    return ind.toJSON();
                }
            })
            .then((res) => {
                const json: any = JSON.parse(res);
                expect(json).toEqual(expect.arrayContaining([{ key: "c08xcjZGNEJBQUE9aFVFTTdSTk5UTzA9cks1Zkpteld4TjQ9MmZmZDJBak0wNkU9", value: ["c08xcjZGNEJBQUE9aFVFTTdSTk5UTzA9cks1Zkpteld4TjQ9MmZmZDJBak0wNkU9"]}]));
            });
    });

    test("clear the datastore", () => {
        expect.assertions(1);
        return orderStorage.clear()
        .then(() => {
            const exists = fs.existsSync(`${CWD}/spec/example/db/orderIds`);
            expect(exists).toBe(false);
        });
    });
});
