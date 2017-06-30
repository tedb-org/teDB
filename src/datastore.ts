/**
 * Created by tsturzl on 4/11/17.
 */
import Index from "./indices";
import { IindexOptions, IStorageDriver, IRange, IupdateOptions } from "./types";
import { Cursor, Ioptions} from "../src";
import { $set, $inc, $mul, $unset, $rename } from "./updateOperators";
import { isEmpty, getPath, getUUID, getDate, rmDups } from "./utlis";
import * as BTT from "binary-type-tree";

/**
 * Array String Number, Date, Boolean, -> symbol was redacted. : Used for keys
 * BTT.ASNDBS = Array<any[]|string|number|Date|boolean|null>|string|number|Date|boolean|null
 * -> redacted symbol, Number, Date, Boolean, String, Array : Used for values
 * BTT.SNDBSA = Array<{}|any[]|string|number|Date|boolean|null>;
 */

export interface IDatastore {
    insert(doc: any): Promise<never>;
    find(query: any): Cursor;
    count(query: any): Cursor;
    update(query: any, operation: any, options: IupdateOptions): Promise<any>;
    remove(query: any): Promise<number>;
    ensureIndex(options: IindexOptions): Promise<null>;
    removeIndex(fieldName: string): Promise<null>;
    saveIndex(fieldName: string): Promise<null>;
    insertIndex(key: string, index: any[]): Promise<null>;
    getIndices(): Promise<any>;
    getDocs(options: Ioptions, ids: string | string[]): Promise<any[]>;
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
    constructor(config: {storage: IStorageDriver}) {
        this.storage = config.storage;
        this.generateId = true;

        this.indices = new Map();
    }

    /**
     * Insert a single document and insert any indices of document into
     * its respective binary tree.
     * @param doc - document to insert
     */
    public insert(doc: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (isEmpty(doc)) {
                return reject(new Error("Cannot insert empty document"));
            }

            doc._id = this.createId();

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
    public find(query: any = {}): Cursor {
        return new Cursor(this, query);
    }

    /**
     * Count documents
     * @param query
     */
    public count(query: any = {}): Cursor {
        return new Cursor(this, query, true);
    }

    /**
     * Update document/s
     * @param query - query document/s to update
     * @param operation - update operation, either a new doc or modifies portions of a document(eg. `$set`)
     * @param options - { fieldName, unique?, compareKeys?, checkKeyEquality? }
     */
    public update(query: any, operation: any, options: IupdateOptions = {}): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (isEmpty(operation)) {
                return reject(new Error("No update without update operation"));
            }
            const promises: Array<Promise<any[]>> = [];
            const indexPromises: Array<Promise<null>> = [];
            const operators: string[] = ["$set", "$mul", "$inc", "$unset", "$rename"];
            const multi: boolean = options.multi || false;
            const upsert: boolean = options.upsert || false;
            const returnUpdatedDocs: boolean = options.returnUpdatedDocs || false;
            const operationKeys: string[] = Object.keys(operation);

            if (multi) {
                return this.find(query)
                    .exec()
                    .then((res): any => {
                        res = res as any[];
                        if (res.length === 0) {
                            if (upsert) {
                                query._id = this.createId();
                                this.indices.forEach((v) => indexPromises.push(v.insert(query)));

                                this.updateDocsIndices([query], promises, indexPromises, operation, operators, operationKeys, reject);
                            } else {
                                return [];
                            }
                        } else {
                            // no return value, all are passed and used by reference.
                            this.updateDocsIndices(res, promises, indexPromises, operation, operators, operationKeys, reject);
                        }

                        // If any index changes - error, reject and do not update and save.
                        Promise.all(indexPromises)
                        .catch(reject);

                        // return promises
                        return Promise.all(promises);
                    })
                    .then((docs: any[]) => rmDups(docs, "_id"))
                    .then((docs: any[]) => {
                        const docPromises: Array<Promise<any[]>> = [];
                        // save new docs to storage driver.
                        docs.forEach((doc) => {
                            docPromises.push(this.storage.setItem(doc._id, doc));
                        });
                        return Promise.all(docPromises);
                    })
                    .then((res) => {
                        if (returnUpdatedDocs) {
                            resolve(res);
                        } else {
                            resolve();
                        }
                    })
                    .catch(reject);
            } else {
                return this.find(query)
                    .limit(1)
                    .exec()
                    .then((res) => {
                        res = res as any[];
                        if (res.length === 0) {
                            if (upsert) {
                                query._id = this.createId();
                                this.indices.forEach((v) => indexPromises.push(v.insert(query)));

                                this.updateDocsIndices([query], promises, indexPromises, operation, operators, operationKeys, reject);
                            } else {
                                return [];
                            }
                        } else {
                            this.updateDocsIndices(res, promises, indexPromises, operation, operators, operationKeys, reject);
                        }
                        Promise.all(indexPromises)
                        .catch(reject);
                        return Promise.all(promises);
                    })
                    .then((docs: any[]) => rmDups(docs, "_id"))
                    .then((docs: any[]) => {
                        const docPromises: Array<Promise<any[]>> = [];
                        // save new docs to storage driver.
                        docs.forEach((doc) => {
                            docPromises.push(this.storage.setItem(doc._id, doc));
                        });
                        return Promise.all(docPromises);
                    })
                    .then((res) => {
                        if (returnUpdatedDocs) {
                            resolve(res);
                        } else {
                            resolve();
                        }
                    })
                    .catch(reject);
            }
        });
    }

    /**
     * Removes document/s by query
     * @param query
     */
    public remove(query: any = {}): Promise<number> {
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
                return reject(e);
            }
            resolve();
        });
    }

    /**
     * Remove index will delete the index from the Map which also
     * holds the Btree of the indices. If you need to remove the
     * index from the persisted version in from the storage driver,
     * call the removeIndex from the storage driver from a different source.
     * This method should not assume you saved the index.
     * @param fieldName - Field that needs index removed
     * @returns {Promise<null>}
     */
    public removeIndex(fieldName: string): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            try {
                this.indices.delete(fieldName);
            } catch (e) {
                return reject(e);
            }
            resolve();
        });
    }

    /**
     * Save the index currently in memory to the persisted version if need be
     * through the storage driver.
     * @param fieldName
     * @returns {Promise<null>}
     */
    public saveIndex(fieldName: string): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            const index = this.indices.get(fieldName);
            if (index) {
                index.toJSON()
                    .then((res) => {
                        return this.storage.storeIndex(fieldName, res);
                    })
                    .then(resolve)
                    .catch(reject);

            } else {
                return reject(new Error(`No index with name ${fieldName} for this datastore`));
            }
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
                                return reject(err);
                           });
                } else {
                    return reject(new Error("No Index for this key was created on this datastore."));
                }
            } catch (e) {
                return reject(e);
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
     * @param options - sort limit skip options
     * @param ids - ID or Array of IDs
     */
    public getDocs(options: Ioptions, ids: string | string[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let idsArr: string[] = (typeof ids === "string") ? [ids] : ids;

            const promises: Array<Promise<any>> = [];

            if (isEmpty(options)) {
                this.createIdsArray(promises, idsArr);
            } else if (options.skip && options.limit) {
                idsArr = idsArr.splice(options.skip, options.limit);
                this.createIdsArray(promises, idsArr);
            } else if (options.skip && !options.limit) {
                idsArr.splice(0, options.skip);
                this.createIdsArray(promises, idsArr);
            } else if (options.limit && !options.skip) {
                idsArr = idsArr.splice(0, options.limit);
                this.createIdsArray(promises, idsArr);
            }

            Promise.all(promises)
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Search for IDs, chooses best strategy. Handles logical operators($or, $and)
     * Returns array of IDs
     * @param fieldName - element name or query start $or/$and
     * @param value - string,number,date,null - or [{ field: value }, { field: value }]
     */
    public search(fieldName?: string, value?: any): Promise<string[]> {
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
                        // Having the results accumulated into a Set means duplication is not possible
                        const resultSet: Set<string> = idSets
                            .reduce((a, b) => new Set(Array.from(a).filter((x) => b.has(x))), idSets.pop());

                        return Array.from(resultSet.values());
                    })
                    .then(resolve)
                    .catch(reject);

            } else if (fieldName !== "$or" && fieldName !== "$and" && fieldName) {
                this.searchField(fieldName, value)
                    .then(resolve)
                    .catch(reject);
            } else if (!fieldName && !value) {
               this.searchField()
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
    private searchField(fieldName?: string, value?: any): Promise<string[]> {
        if (fieldName && value) {
            return this.indices.has(fieldName) ?
                this.searchIndices(fieldName, value) :
                this.searchCollection(fieldName, value);
        } else {
            return this.searchCollection();
        }
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
    private searchCollection(fieldName?: string, value?: IRange): Promise<string[]> {
        return new Promise((resolve, reject): any => {
            const ids: string[] = [];
            if (fieldName && value) {
                const lt: BTT.ASNDBS = (value.hasOwnProperty("$lt") && value.$lt !== undefined) ? value.$lt : null;
                const lte: BTT.ASNDBS = (value.hasOwnProperty("$lte") && value.$lte !== undefined) ? value.$lte : null;
                const gt: BTT.ASNDBS = (value.hasOwnProperty("$gt") && value.$gt !== undefined) ? value.$gt : null;
                const gte: BTT.ASNDBS = (value.hasOwnProperty("$gte") && value.$gte !== undefined) ? value.$gte : null;
                const ne: any =  value.hasOwnProperty("$ne") ? value.$ne : null;
                this.storage.iterate((v, k) => {
                    const field: any = getPath(v, fieldName);
                    if (field) {
                        if (lt === null && lte === null && gt === null &&
                            gte === null && ne === null && k === value) {
                            ids.push(k);
                        } else {
                            const flag: boolean =
                                (
                                    ((lt && field < lt) !== null) ||
                                    ((lte && field <= lte) !== null) ||
                                    ((gt && field > gt) !== null) ||
                                    ((gte && field >= gte) !== null) ||
                                    ((ne && field !== ne) !== null)
                                ) ||
                                (value && field === value);
                            if (flag) {
                                ids.push(k);
                            }
                        }
                    }
                })
                .then(() => {
                    resolve(ids);
                })
                .catch(reject);
            } else {
                // here return keys from storage driver
                this.storage.keys()
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    private updateDocsIndices(docs: any[], promises: Array<Promise<any[]>>, indexPromises: Array<Promise<null>>, operation: any, operators: string[], operationKeys: string[], reject: any): any {
        docs.forEach((doc: any) => {  // each doc
            let mathed: number;
            let preMath: number;
            // update indices
            this.indices.forEach((index, field) => { // each index in datastore
                operationKeys.forEach((k) => { // each op key sent by user
                    if (operationKeys.indexOf(k) !== -1) {
                        const setKeys = Object.keys(operation[k]);
                        switch (k) {
                            case "$set":
                                setKeys.forEach((sk) => { // each $set obj key
                                    if (field === sk) {
                                        // update the index value with the new
                                        // value if the index fieldname =
                                        // the $set obj key.
                                        indexPromises.push(index.updateKey(getPath(doc, field), operation[k][sk]));
                                    }
                                });
                                break;
                            case "$mul":
                                setKeys.forEach((mk) => {
                                    if (field === mk) {
                                        if (mathed) {
                                            preMath = mathed;
                                            mathed = mathed * operation[k][mk];
                                        } else {
                                            mathed = getPath(doc, field) * operation[k][mk];
                                        }
                                        const indexed = preMath ? preMath : getPath(doc, field);
                                        indexPromises.push(index.updateKey(indexed, mathed));
                                    }
                                });
                                break;
                            case "$inc":
                                setKeys.forEach((ik) => {
                                    if (field === ik) {
                                        if (mathed) {
                                            preMath = mathed;
                                            mathed = mathed + operation[k][ik];
                                        } else {
                                            mathed = getPath(doc, field) + operation[k][ik];
                                        }
                                        const indexed = preMath ? preMath : getPath(doc, field);
                                        indexPromises.push(index.updateKey(indexed, mathed));
                                    }
                                });
                                break;
                            case "$unset":
                                setKeys.forEach((ik) => {
                                    if (field === ik) {
                                        // To unset a field that is indexed
                                        // remove the document. The index remove
                                        // method has this ref and knows the value
                                        indexPromises.push(index.remove(doc));
                                    }
                                });
                                break;
                            case "$rename":
                                setKeys.forEach((rn) => {
                                    if (field === rn) {
                                        // save current index value
                                        const indexValue = this.indices.get(field);
                                        // delete current index
                                        this.removeIndex(field)
                                        .then(() => {
                                            // create new index with old value new name
                                            if (indexValue) {
                                                this.indices.set(operation[k][rn], indexValue);
                                            } else {
                                                return reject(new Error(`Cannot rename index of ${field} that does not exist`));
                                            }
                                        })
                                        .catch((e) => reject(e));
                                    }
                                });
                                break;
                        }
                    }
                });
            });
            // Update Docs
            operationKeys.forEach((k) => {
                if (operators.indexOf(k) !== -1) {
                    switch (k) {
                        case "$set": promises.push($set(doc, operation[k])); break;
                        case "$mul": promises.push($mul(doc, operation[k])); break;
                        case "$inc": promises.push($inc(doc, operation[k])); break;
                        case "$unset": promises.push($unset(doc, operation[k])); break;
                        case "$rename": promises.push($rename(doc, operation[k])); break;
                    }
                }
            });
        });
    }

    /**
     * Return fill provided promise array with promises from the storage driver
     * @param promises
     * @param ids
     */
    private createIdsArray(promises: Array<Promise<any>>, ids: string[]): void {
        ids.forEach((id) => {
            promises.push(this.storage.getItem(id));
        });
    }

    /**
     * Create Unique ID that contains timestamp
     */
    private createId(): string {
        return getUUID();
    }
}
