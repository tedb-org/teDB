/**
 * Created by tsturzl on 4/11/17.
 */
import Datastore from "./datastore";
import { mergeSort, getSortType} from "./utils";
import {isEmpty, flattenArr, rmArrDups} from "tedb-utils";

export interface ICursor {
    sort(sort: any): this;
    skip(skip: number): this;
    limit(limit: number): this;
    exec(): Promise<any[] | number>;
}

/**
 * Simply used for $anding default inputs.
 */
export interface I$and {
    $and: any[];
}

export interface Ioptions {
    sort?: any;
    skip?: number;
    limit?: number;
}

/**
 * Database Cursor
 */
export default class Cursor implements ICursor {
    /** Reference to Datastore object */
    private datastore: Datastore;
    /** Query passed from `Datastore.find` or `count` */
    private query: any;
    /** Options for `exec` */
    private options: Ioptions;

    /** Is this a count operation? */
    private count: boolean;

    /**
     * Constructor
     * @param datastore - Datastore reference
     * @param query - query for search
     * @param count - is this a count operation? Default: false
     */
    constructor(datastore: Datastore, query: any = {}, count?: boolean) {
        this.datastore = datastore;
        this.query = query;
        this.count = count || false;
        this.options = {};
    }

    /**
     * Sort order for fields
     * @param sort - sort object `{fieldName: 1 | -1}`
     */
    public sort(sort: any): this {
        this.options.sort = sort;
        return this;
    }

    /**
     * Set how many results to skip
     * @param skip - how many results to skip
     */
    public skip(skip: number): this {
        this.options.skip = skip;

        return this;
    }

    /**
     * Limit result size
     * @param limit - how many results
     */
    public limit(limit: number): this {
        this.options.limit = limit;

        return this;
    }

    /**
     * Execute the Cursor
     */
    public exec(): Promise<any[] | number> {
        return new Promise<any[] | number>((resolve, reject) => {
            const promisesGetIds: Array<Promise<string[]>> = [];
            if (isEmpty(this.query)) {
                promisesGetIds.push(this.datastore.search());
            } else {
                const searchKeys = Object.keys(this.query);
                if (searchKeys.indexOf("$or") !== -1 || searchKeys.indexOf("$and") !== -1) {
                    for (const field in this.query) {
                        if (this.query.hasOwnProperty(field)) {
                            promisesGetIds.push(this.datastore.search(field, this.query[field]));
                        }
                    }
                } else {
                    const searchValues = Object.values(this.query);
                    const newQuery: I$and = {$and: []};
                    searchKeys.forEach((v: any, i: number) => {
                        const obj: any = {};
                        obj[v] = searchValues[i];
                        newQuery.$and.push(obj);
                    });
                    promisesGetIds.push(this.datastore.search("$and", newQuery.$and));
                }
            }

            const joined: any = Promise.all(promisesGetIds); // confusing type issues*

            joined
                .then((idsArr: string[][]): number | Promise<any[]>  => {
                    idsArr = flattenArr(idsArr);
                    const ids = rmArrDups(idsArr);
                    if (this.count) {
                        return ids.length;
                    } else {
                        return this.datastore.getDocs(this.options, ids);
                    }
                })
                .then((res: any[]) => {
                    if (this.options.sort) {
                        try {
                            const sortKey = Object.keys(this.options.sort)[0];
                            // at created at field for querying
                            if (sortKey === "$created_at") {
                                res.forEach((doc) => {
                                    doc.$created_at = this.datastore.getIdDate(doc._id);
                                });
                            }
                            const sortValue = this.options.sort[sortKey];
                            const sortType = getSortType(res, sortKey);
                            if (sortType === "") {
                                // can't sort null or undefined
                                return res;
                            } else {
                                if (sortKey === "$created_at") {
                                    const removeCreatedAtField = mergeSort(res, sortKey, sortValue, sortType);
                                    removeCreatedAtField.forEach((doc: any) => delete doc.$created_at);
                                    return removeCreatedAtField;
                                } else {
                                    return mergeSort(res, sortKey, sortValue, sortType);
                                }
                            }
                        } catch (e) {
                            return reject(e);
                        }
                    } else {
                        return res;
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    }
}
