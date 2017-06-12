/**
 * Created by tsturzl on 4/11/17.
 */
import Index from "./indices";
import { IindexOptions, IStorageDriver, IRange, IupdateOptions } from "./types";
import Cursor from "./cursor";
import { getPath } from "./utlis/get_path";
import { getUUID, getDate } from "./utlis/id_hasher";
import * as BTT from "binary-type-tree";

export interface IDatastore {
    insert(doc: any): Promise<never>;
    find(query: any): Cursor;
    count(query: any): Cursor;
    update(query: any, operation: any, options: IupdateOptions): Promise<any>;
    remove(query: any): Promise<number>;
    ensureIndex(options: IindexOptions): Promise<null>;
    removeIndex(options: IindexOptions): Promise<null>;
    insertIndex(key: string, index: any[]): Promise<null>;
    getIndices(): Promise<any>;
    getDocs(ids: string | string[]): Promise<any[]>;
    search(fieldName: string, value: any): Promise<string[]>;
}

/**
 * Datastore class
 * Creates a new Datastore using a specified storageDriver
 */
export default class Datastore implements IDatastore {

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
     * Insert a single document and insert any indices of document into
     * its respective binary tree.
     * @param doc - document to insert
     */
    public insert(doc: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.generateId) {
                doc._id = this.createId();
            }

            const indexPromises: Array<Promise<never>> = [];

            this.indices.forEach((v) => {
                indexPromises.push(v.insert(doc));
            });

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
     * @param options - options f
     */
    public update(query: any, operation: any, options: IupdateOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve();
        });
    }

    /**
     * Removes document/s by query
     * @param query
     */
    public remove(query: any): Promise<number> {
        return new Promise((resolve, reject) => {
            this.find(query)
                .exec()
                .then((docs: any[]): Promise<any[][]> => {
                    // Array of promises for index remove
                    const promises: Array<Promise<any[]>> = [];

                    for (let i = docs.length - 1; i >= 0; i--) {
                        this.indices.forEach((v) => {
                            promises.push(v.remove(docs[i]));
                        });
                    }

                    return Promise.all(promises);
                })
                .then((docs: any[]) => {
                    const promises: Array<Promise<null>> = [];
                    const uniqueIds: string[] = [];

                    for (let i = docs.length - 1; i >= 0; i--) {
                        if (uniqueIds.indexOf(docs[i]._id) === -1) {
                            uniqueIds.push(docs[i]._id);
                        }
                    }

                    for (let i = uniqueIds.length - 1; i >= 0; i--) {
                        if (uniqueIds[i] && typeof uniqueIds[i] === "string") {
                            promises.push(this.storage.removeItem(uniqueIds[i]));
                        }
                    }

                    Promise.all(promises)
                        .then((): any => {
                            resolve(uniqueIds.length);
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
    public ensureIndex(options: IindexOptions): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            try {
                this.indices.set(options.fieldName, new Index(this, options));
            } catch (e) {
                reject(e);
            }
            resolve();
        });
    }

    /**
     * Remove index will delete the index from the Map which also
     * holds the Btree of the indices.
     * @param options
     * @returns {Promise<null>}
     */
    public removeIndex(options: IindexOptions): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            try {
                this.indices.delete(options.fieldName);
            } catch (e) {
                reject(e);
            }
            resolve();
        });
    }

    /**
     * Insert a stored index into the index of this datastore
     * @param key - the index fieldName
     * @param index - the key value pair obj
     * @returns {Promise<null>}
     */
    public insertIndex(key: string, index: any[]): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            try {
                const indices = this.indices.get(key);
                if (indices !== undefined) {
                    indices.insertMany(key, index)
                           .then(resolve)
                           .catch((err) => {
                                reject(err);
                           });
                } else {
                    reject(new Error("No Index for this key was created on this datastore."));
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Retrieve the indices of this datastore.
     * @returns {Promise<any>}
     */
    public getIndices(): Promise<any> {
        return new Promise<any>((resolve) => {
            resolve(this.indices);
        });
    }

    /**
     * Get Document by ID/s
     * @param ids - ID or Array of IDs
     */
    public getDocs(ids: string | string[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const idsArr: string[] = (typeof ids === "string") ? [ids] : ids;

            const promises: Array<Promise<any>> = [];

            idsArr.forEach((id) => {
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
        return new Promise((resolve, reject) => {
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
     * Get Date from ID ... do we need this on the dataStore?
     * @param id - the `_id` of the document to get date of
     */
    public getIdDate(id: string): Date {
        return getDate(id);
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
     * Example 1: dbName.searchIndices("fieldName", "1234");
     * will return the value id of that key as an array of one element.
     * Example 2: dbName.searchIndices("fieldName", { $gte: 1, $lte 10, $ne: 3 }
     * will return an array of ids from the given range.
     * Returns array of IDs
     * @param fieldName - field to search
     * @param value - value to search by
     */
    private searchIndices(fieldName: string, value: IRange): Promise<BTT.SNDBSA> {
        return new Promise<BTT.SNDBSA>((resolve) => {
            const index: Index | undefined = this.indices.get(fieldName);

            if (!index) {
                return resolve(undefined);
            }

            if (typeof value === "object") {
                resolve(index.searchRange(value));
            } else {
                resolve(index.search(value));
            }
        });
    }

    /**
     * Search collection by field, essentially a collection scan
     * Returns array of IDs
     * @param fieldName - field to search
     * @param value - value to search by
     */
    private searchCollection(fieldName: string, value: IRange): Promise<string[]> {
        return new Promise((resolve, reject): any => {
            const ids: string[] = [];
            const lt: BTT.ASNDBS = value.$lt || null;
            const lte: BTT.ASNDBS = value.$lte || null;
            const gt: BTT.ASNDBS = value.$gt || null;
            const gte: BTT.ASNDBS = value.$gte || null;
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
}
