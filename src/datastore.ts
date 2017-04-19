/**
 * Created by tsturzl on 4/11/17.
 */
import Index from "./indices";
import { IStorageDriver } from "./types/storageDriver";
import { IRange } from "./types/range";
import Cursor from "./cursor";
import Hashids from "hashids";
import * as _ from "lodash";

/**
 * Datastore class
 * Creates a new Datastore using a specified storageDriver
 */
export default class Datastore {
    /** A HashMap of all the indices keyed by the fieldName. <fieldName, Index> */
    private indices: Map<string, Index>;
    /** StorageDriver that is used for this Datastore */
    private storage: IStorageDriver;
    /** Hasher for generating unique IDs */
    private hasher: Hashids;
    /** whether or not to generate IDs automatically */
    private generateId: boolean;

    /**
     * @param config - config object `{storage: IStorageDriver, generateId?: boolean}`
     */
    constructor(config: {storage: IStorageDriver, generateId?: boolean}) {
        this.storage = config.storage;
        this.generateId = config.generateId || true;

        this.indices = new Map();

        this.hasher = new Hashids("TeDB-IDs");
    }

    /**
     * Insert a single document
     * @param doc - document to insert
     */
    public insert(doc: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.generateId) {
                doc._id = this.createId();
            }

            const indexPromises = [];

            for (const index of this.indices.values()) {
                indexPromises.push(index.insert(doc));
            }

            Promise.all(indexPromises)
                .then(() => {
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
        return new Promise((resolve, reject) => {});
    }

    /**
     * Removes document/s by query
     * @param query
     */
    public remove(query: any): Promise<number> {
        return new Promise((resolve, reject) => {
            const promises: Array<Promise<string[]>> = [];

            for (const field in query) {
                if (query.hasOwnProperty(field)) {
                    promises.push(this.search(field, query[field]));
                }
            }

            Promise.all(promises)
                .then((idsArr: string[][]) => {
                    // Use a Set to dedupe
                    const idSet: Set<string> = idsArr
                        .reduce((a, b) => a.concat(b), [])
                        .reduce((set: Set<string>, id): Set<string> => set.add(id), new Set());

                    const ids = Array.from(idSet.values());

                    // this.getDocs()
                })
                .catch(reject);
        });
    }

    /**
     * Ensure an index on the datastore
     * @param options - {fieldName: string}
     */
    public ensureIndex(options: {fieldName: string}): Promise<null> {
        return new Promise<null>((resolve) => {
            this.indices.set(options.fieldName, new Index(this, options));
            resolve();
        });
    }

    /**
     * Get Document by ID/s
     * @param ids - ID or Array of IDs
     */
    public getDocs(ids: string | string[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const idsArr: string[] = (typeof ids === "string") ? [].concat(ids) : ids;

            const promises: Array<Promise<any>> = [];

            idsArr.forEach((id: string) => {
                promises.push(this.storage.getItem(id));
            });

            Promise.all(promises)
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Search for IDs, chooses best strategy, preferring to search indices if they exist for the given field.
     * Returns array of IDs
     * @param fieldName
     * @param value
     */
    public search(fieldName: string, value: any): Promise<string[]> {
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
        return new Promise((resolve) => {
            const index = this.indices.get(fieldName);

            if (!index) {
                return resolve(null);
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
        return new Promise((resolve, reject) => {
            const ids: string[] = [];
            const lt: number = value.$lt || null;
            const lte: number = value.$lte || null;
            const gt: number = value.$gt || null;
            const gte: number = value.$gte || null;
            const ne: any = value.$ne || null;
            this.storage.iterate((v, k) => {
                const field = _.get(v, fieldName);
                if (field) {
                    const flag =
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
        const rand = (): number => Math.floor(Math.random() * 0o777777777777777777777);

        const timestamp = Date.now();

        return this.hasher.encode([timestamp, rand(), rand(), rand(), rand()]);
    }

    /**
     * Get Date from ID
     * @param id - the `_id` of the document to get date of
     */
    private getIdDate(id: string): Date {
        return new Date(this.hasher.decode(id)[0]);
    }
}
