/**
 * Created by tsturzl on 4/11/17.
 */
import { getPath } from "./utlis/get_path";
import Datastore from "./datastore";
import { IRange, IindexOptions } from "./types";
import { compareArray } from "./utlis/compareArray";
import * as BTT from "binary-type-tree";

export interface IIndex {
    insert(doc: any): Promise<any>;
    updateKey(key: BTT.ASNDBS, newKey: BTT.ASNDBS): Promise<any>;
    remove(doc: any): Promise<any>;
    toJSON(): Promise<string>;
    search(key: BTT.ASNDBS): Promise<BTT.SNDBSA>;
    searchRange(range: IRange): Promise<BTT.SNDBSA>;
}

export default class Index implements IIndex {
    /** Field Name for Index */
    protected fieldName: string;
    /** ALV Tree for indexing */
    private avl: BTT.AVLTree;
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
        this.avl = options.unique ? new BTT.AVLTree({unique: true}) : new BTT.AVLTree({});

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

    /**
     * Insert document into Index
     * @param doc - document to insert into Index
     */
    public insert(doc: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // TODO: need to make Error types
            if (!doc.hasOwnProperty("_id")) {
                return reject(new Error("Document is missing _id field"));
            }
            if (typeof !doc._id !== "string") {
                return reject(new Error("_id field needs to be type `string`"));
            }

            const key: BTT.ASNDBS = getPath(doc, this.fieldName);

            if (key) {
                if (key.constructor.name === "Array" && !this.isArray) {
                    this.avl.compareKeys = compareArray;
                    this.isArray = true;
                }
            } else {
                return reject(new Error("Key was not retrieved from document"));
            }

            try {
                this.avl.insert(key, doc._id);
            } catch (e) {
                return reject(e);
            }

            resolve(doc);
        });
    }

    /**
     * Update a key of a tree
     * @param key
     * @param newKey
     * @returns {Promise<null>}
     */
    public updateKey(key: BTT.ASNDBS, newKey: BTT.ASNDBS): Promise<null> {
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
     */
    public remove(doc: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!doc.hasOwnProperty("_id")) {
                return; // TODO: should throw an error, need to make Error types
            }

            const key: BTT.ASNDBS = getPath(doc, this.fieldName);

            try {
                this.avl.delete(key, doc._id);
            } catch (e) {
                return reject(e);
            }

            resolve(doc);
        });
    }

    /**
     * Return the tree as JSON { key, value } pairs.
     * @returns {any}
     */
    public toJSON(): Promise<string> {
        return new Promise<string>((resolve) => {
            resolve(this.avl.toJSON());
        });
    }

    /**
     * Search Index for key
     * @param key - key to search by
     */
    public search(key: BTT.ASNDBS): Promise<BTT.SNDBSA> {
        return new Promise<BTT.SNDBSA>((resolve) => {
            resolve(this.avl.tree.search(key));
        });
    }

    /**
     * Search Index within bounds
     * @param range - An IRange to search within bounds
     */
    public searchRange(range: IRange): Promise<BTT.SNDBSA> {
        return new Promise<BTT.SNDBSA>((resolve) => {
            resolve(this.avl.tree.query(range));
        });
    }
}
