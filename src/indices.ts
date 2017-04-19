/**
 * Created by tsturzl on 4/11/17.
 */
import * as _ from "lodash";
import Datastore from "./datastore";
import { IRange } from "./types/range";
import * as BTT from "binary-type-tree";

export default class Index {
    /** Field Name for Index */
    protected fieldName: string;
    /** ALV Tree for indexing */
    private tree: any;
    /** Reference to Datastore */
    private datastore: Datastore;

    /**
     * Constructor
     * @param datastore - reference to Datastore
     * @param options - Options for Index, `{fieldName: string}`
     */
    constructor(datastore: Datastore, options: {fieldName: string}) {
        this.tree = new ALVTree();
        this.fieldName = options.fieldName;
        this.datastore = datastore;
    }

    /**
     * Insert document into Index
     * @param doc - document to insert into Index
     */
    public insert(doc: any): Promise<any> {
        return new Promise<any>((resolve) => {
            if (!doc.hasOwnProperty("_id")) {
                return; // TODO: should throw an error, need to make Error types
            }

            const key = _.get(doc, this.fieldName);
            this.tree.insert(key, doc._id);

            resolve(doc);
        });
    }

    /**
     * Remove document from Index
     * @param doc
     */
    public remove(doc: any): Promise<null> {
        return new Promise<null>((resolve) => {
            if (!doc.hasOwnProperty("_id")) {
                return; // TODO: should throw an error, need to make Error types
            }

            const key = _.get(doc, this.fieldName);

            this.tree.delete(key, doc._id);

            resolve();
        });
    }

    /**
     * Search Index for key
     * @param key - key to search by
     */
    public search(key: any): Promise<any> {
        return new Promise((resolve) => {
            resolve(this.tree.search(key));
        });
    }

    /**
     * Search Index within bounds
     * @param range - An IRange to search within bounds
     */
    public searchRange(range: IRange): Promise<any> {
        return new Promise((resolve) => {
            resolve(this.tree.searchBounds(range));
        });
    }
}
