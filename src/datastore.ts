/**
 * Created by tsturzl on 4/11/17.
 */
import Index from "./indices";
import { IStorageDriver } from "./types/storageDriver";
import { IRange } from "./types/range";
import Cursor from "./cursor";
import { getPath } from "./utlis/get_path";
import { getUUID, decode } from "./utlis/id_hasher";

/**
 * Datastore class
 * Creates a new Datastore using a specified storageDriver
 */
export default class Datastore {

    /** A HashMap of all the indices keyed by the fieldName. <fieldName, Index> */
    private indices: Map<string, Index>;
    /** StorageDriver that is used for this Datastore */
    private storage: IStorageDriver;
    /** whether or not to generate IDs automatically */
    private generateId: boolean;

    /**
     * @param config - config object `{storage: IStorageDriver, generateId?: boolean}`
     */
    constructor(config: {storage: IStorageDriver, generateId?: boolean}) {
        this.storage = config.storage;
        this.generateId = config.generateId || true;

        this.indices = new Map();
    }

    /**
     * Insert a single document
     * @param doc - document to insert
     */
    public insert(doc: any): Promise<never> {
        return new Promise((resolve, reject): any => {
            if (this.generateId) {
                doc._id = this.createId();
            }

            const indexPromises: Array<Promise<never>> = [];

            for (const index of this.indices.values()) {
                indexPromises.push(index.insert(doc));
            }

            Promise.all(indexPromises)
                .then((): any => {
                    return this.storage.setItem(doc._id, doc);
                })
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Find documents
     * @param query
     */
    public find(query: any): Cursor {
        return new Cursor(this, query);
    }

    /**
     * Count documents
     * @param query
     */
    public count(query: any): Cursor {
        return new Cursor(this, query, true);
    }

    /**
     * Update document/s
     * @param query - query document/s to update
     * @param operation - update operation, either a new doc or modifies portions of a document(eg. `$set`)
     */
    public update(query: any, operation: any): Promise<number> {
        return new Promise((resolve, reject): any => {
            resolve("not done yet");
        });
    }

    /**
     * Removes document/s by query
     * @param query
     */
    public remove(query: any): Promise<number> {
        return new Promise((resolve, reject): any => {
            const fields: string[] = [];

            for (const field in query) {
                if (query.hasOwnProperty(field)) {
                    fields.push(field);
                }
            }

            this.find(query)
                .exec()
                .then((docs: any[]) => {
                    // Array of promises for index remove
                    const promises: Array<Promise<any[]>> = [];

                    fields.forEach((field): void => {
                        const index: Index | undefined = this.indices.get(field);
                        if (index) {
                            docs.forEach((doc): void => {
                                promises.push(index.remove(doc));
                            });
                        }
                    });

                    return Promise.all(promises);
                })
                .then((docs: any[]) => {
                    const promises: Array<Promise<null>> = [];

                    docs.forEach((doc): void => {
                        const id: string = doc._id;
                        if (id && typeof id === "string") {
                            promises.push(this.storage.removeItem(id));
                        }
                    });

                    Promise.all(promises)
                        .then((): any => {
                            resolve(docs.length);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Ensure an index on the datastore
     * @param options - {fieldName: string}
     */
    public ensureIndex(options: {fieldName: string}): Promise<null> {
        return new Promise<null>((resolve): any => {
            this.indices.set(options.fieldName, new Index(this, options));
            resolve();
        });
    }

    /**
     * Get Document by ID/s
     * @param ids - ID or Array of IDs
     */
    public getDocs(ids: string | string[]): Promise<any[]> {
        return new Promise((resolve, reject): any => {
            const idsArr: string[] = (typeof ids === "string") ? [ids] : ids;

            const promises: Array<Promise<any>> = [];

            idsArr.forEach((id): void => {
                promises.push(this.storage.getItem(id));
            });

            Promise.all(promises)
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Search for IDs, chooses best strategy. Handles logical operators($or, $and)
     * Returns array of IDs
     * @param fieldName
     * @param value
     */
    public search(fieldName: string, value: any): Promise<string[]> {
        return new Promise((resolve, reject): any => {
            if (fieldName === "$or" && value instanceof Array) {
                const promises: Array<Promise<string[]>> = [];

                value.forEach((query): void => {
                    for (const field in query) {
                        if (typeof field === "string" && query.hasOwnProperty(field)) {
                            promises.push(this.searchField(field, query[field]));
                        }
                    }
                });

                Promise.all(promises)
                    .then((idsArr: string[][]): string[] => {
                        const idSet: Set<string> = idsArr
                            .reduce((a, b) => a.concat(b), [])
                            .reduce((set: Set<string>, id): Set<string> => set.add(id), new Set());

                        return Array.from(idSet.values());
                    })
                    .then(resolve)
                    .catch(reject);

            } else if (fieldName === "$and" && value instanceof Array) {
                // Combine query results with set intersection
                // this means all queries must match for the document's _id to return
                const promises: Array<Promise<string[]>> = [];

                value.forEach((query): void => {
                    for (const field in query) {
                        if (typeof field === "string" && query.hasOwnProperty(field)) {
                            promises.push(this.searchField(field, query[field]));
                        }
                    }
                });

                Promise.all(promises)
                    // Convert Array of Arrays into Array of Sets
                    .then((idsArr: string[][]): Array<Set<string>> => {
                        return idsArr.map((ids) =>
                            ids.reduce((set: Set<string>, id): Set<string> => set.add(id), new Set()));
                    })
                    // Intersect all Sets into a single result Set
                    .then((idSets: Array<Set<string>>): string[] => {
                        // Having the results accumulated into a Set means to duplication is possible
                        const resultSet: Set<string> = idSets
                            .reduce((a, b) => new Set([...a].filter((x) => b.has(x))), idSets.pop());

                        return Array.from(resultSet.values());
                    })
                    .then(resolve)
                    .catch(reject);

            } else if (fieldName !== "$or" && fieldName !== "$and") {
                this.searchField(fieldName, value)
                    .then(resolve)
                    .catch(reject);
            } else {
                return reject(new Error("Logical operators expect an Array"));
            }
        });
    }

    /**
     * Search for IDs, chooses best strategy, preferring to search indices if they exist for the given field.
     * Returns array of IDs
     * @param fieldName
     * @param value
     */
    private searchField(fieldName: string, value: any): Promise<string[]> {
        return this.indices.has(fieldName) ?
            this.searchIndices(fieldName, value) :
            this.searchCollection(fieldName, value);
    }

    /**
     * Search indices by field
     * Returns array of IDs
     * @param fieldName - field to search
     * @param value - value to search by
     */
    private searchIndices(fieldName: string, value: any): Promise<string[]> {
        return new Promise((resolve): any => {
            const index: Index | undefined = this.indices.get(fieldName);

            if (!index) {
                return resolve(undefined);
            }

            if (typeof value === "object") {
                const range: IRange = value as IRange;
                index.searchRange(range);
            } else {
                index.search(value);
            }
        });
    }

    /**
     * Search collection by field, essentially a collection scan
     * Returns array of IDs
     * @param fieldName - field to search
     * @param value - value to search by
     */
    private searchCollection(fieldName: string, value: any): Promise<string[]> {
        return new Promise((resolve, reject): any => {
            const ids: string[] = [];
            const lt: number = value.$lt || null;
            const lte: number = value.$lte || null;
            const gt: number = value.$gt || null;
            const gte: number = value.$gte || null;
            const ne: any = value.$ne || null;
            this.storage.iterate((v, k) => {
                const field: any = getPath(v, fieldName);
                if (field) {
                    const flag: boolean =
                        (
                            (lt && field < lt) &&
                            (lte && field <= lte) &&
                            (gt && field > gt) &&
                            (gte && field >= gte) &&
                            (ne && field !== ne)
                        ) ||
                        (value && field === value);

                    if (flag) {
                        ids.push(k);
                    }
                }
            })
                .then(() => {
                    resolve(ids);
                })
                .catch(reject);
        });
    }

    /**
     * Create Unique ID that contains timestamp
     */
    private createId(): string {
        return getUUID();
    }

    /**
     * Get Date from ID
     * @param id - the `_id` of the document to get date of
     */
    private getIdDate(id: string): Date {
        return new Date(decode(id)[0]);
    }
}
