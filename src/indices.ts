/**
 * Created by tsturzl on 4/11/17.
 */
import { getPath } from "./utils";
import Datastore from "./datastore";
import { IRange, IindexOptions } from "./types";
import { compareArray } from "./utils";
import { AVLTree, ASNDBS, SNDBSA } from "binary-type-tree";

/**
 * Index interface used for the datastore indices
 * Inherits types from binary-type-tree
 *
 * ~~~
 * Array String Number, Date, Boolean, -> symbol was redacted.
 * ASNDBS = Array<any[]|string|number|Date|boolean|null>|string|number|Date|boolean|null
 * -> redacted symbol, Number, Date, Boolean, String, Array
 * SNDBSA = Array<{}|any[]|string|number|Date|boolean|null>;
 * ~~~
 */
export interface IIndex {
    insert(doc: any): Promise<any>;
    insertMany(key: ASNDBS, indices: any[]): Promise<null>;
    updateKey(key: ASNDBS, newKey: ASNDBS): Promise<any>;
    remove(doc: any): Promise<any>;
    removeByPair(key: any, value: string): Promise<any>;
    toJSON(): Promise<string>;
    search(key: ASNDBS): Promise<SNDBSA>;
    traverse(fn: any): Promise<any>;
    searchRange(range: IRange): Promise<SNDBSA>;
}

export default class Index implements IIndex {
    /** Field Name for Index */
    protected fieldName: string;
    /** ALV Tree for indexing */
    private avl: AVLTree;
    /** Reference to Datastore */
    private datastore: Datastore;
    /** Is the index holding an array */
    private isArray: boolean;

    /**
     * Constructor
     * @param datastore - reference to Datastore
     * @param options - Options for Index, `{fieldName: string}`
     */
    constructor(datastore: Datastore, options: IindexOptions) {
        this.avl = options.unique ? new AVLTree({unique: true}) : new AVLTree({});

        if (options.compareKeys) {
            this.avl.compareKeys = options.compareKeys;
        }
        if (options.checkKeyEquality) {
            this.avl.checkKeyEquality = options.checkKeyEquality;
        }

        this.isArray = false;

        this.fieldName = options.fieldName;
        this.datastore = datastore;
    }

    public traverse(fn: any): Promise<any> {
        return this.avl.tree.executeOnEveryNode(fn);
    }

    /**
     * Insert document into Index
     * @param doc - document to insert into Index
     * @returns {Promise<any>}
     */
    public insert(doc: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // TODO: need to make Error types
            if (!doc.hasOwnProperty("_id")) {
                return reject(new Error("Document is missing _id field"));
            }
            if (typeof doc._id !== "string") {
                return reject(new Error("_id field needs to be type `string`"));
            }

            const key: ASNDBS = getPath(doc, this.fieldName);
            if (key !== undefined && key !== null) {
                if (Object.prototype.toString.call(key) === "[object Array]" && !this.isArray) {
                    this.avl.compareKeys = compareArray;
                    this.isArray = true;
                }
            } else {
                return reject(new Error("Key was not retrieved from document, or key was set to null. No null key indices"));
            }
            try {
                this.avl.insert(key, [doc._id]);
            } catch (e) {
                return reject(e);
            }

            resolve(doc);
        });
    }

    /**
     * Inserts many documents and updates the indices
     * @param key
     * @param indices
     * @returns {Promise<null>}
     */
    public insertMany(key: ASNDBS, indices: any[]): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            if (key !== undefined && key !== null) {
                if (Object.prototype.toString.call(key) === "[object Array]" && !this.isArray) {
                    this.avl.compareKeys = compareArray;
                    this.isArray = true;
                }
            } else {
                return reject(new Error("Key was not retrieved"));
            }

            try {
                for (const item of indices) {
                    this.avl.insert(item.key, item.value);
                }
            } catch (e) {
                return reject(e);
            }

            resolve();
        });
    }

    /**
     * Update a key of a tree
     * - keys are actually the value, in the tree the keys are values
     * of the to be updated document while the value in the tree is the
     * _id of the to be updated document.
     * @param key
     * @param newKey
     * @returns {Promise<null>}
     */
    public updateKey(key: ASNDBS, newKey: ASNDBS): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            if (this.avl.tree.search(key).length === 0) {
                return reject(new Error("This key does not exist"));
            }
            try {
                this.avl.updateKey(key, newKey);
            } catch (e) {
                return reject(e);
            }
            resolve();
        });
    }

    /**
     * Remove document from Index
     * @param doc
     * @returns {Promise<any>}
     */
    public remove(doc: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!doc.hasOwnProperty("_id")) {
                return reject(new Error("There is no _id to reference this document"));
            }

            const key: ASNDBS = getPath(doc, this.fieldName);

            try {
                this.avl.Delete(key, [doc._id]);
            } catch (e) {
                return reject(e);
            }

            resolve(doc);
        });
    }

    /**
     * Made to remove an indexed item just by the key value pair itself instead
     * of the full object.
     * @param key
     * @param {string} value
     * @returns {Promise<any>}
     */
    public removeByPair(key: any, value: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.avl.Delete(key, [value]);
            } catch (e) {
                return reject(e);
            }
            resolve();
        });
    }

    /**
     * Return the tree as JSON [{ key, value }, ...] pairs.
     * @returns {Promise<string>}
     */
    public toJSON(): Promise<string> {
        return this.avl.tree.toJSON();
    }

    /**
     * Search Index for key
     * @param key
     * @returns {Promise<SNDBSA>}
     */
    public search(key: ASNDBS): Promise<SNDBSA> {
        return new Promise<SNDBSA>((resolve) => {
            resolve(this.avl.tree.search(key));
        });
    }

    /**
     * Search Index within bounds
     * @param range An IRange to search within bounds
     * @returns {Promise<SNDBSA>}
     */
    public searchRange(range: IRange): Promise<SNDBSA> {
        return new Promise<SNDBSA>((resolve) => {
            resolve(this.avl.tree.query(range));
        });
    }
}
