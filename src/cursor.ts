/**
 * Created by tsturzl on 4/11/17.
 */
import Datastore from "./datastore";

/**
 * Database Cursor
 */
export default class Cursor {
    /** Reference to Datastore object */
    private datastore: Datastore;
    /** query passed from `Datastore.find` */
    private query: any;
    /** options for `exec` */
    private options: {
        sort: any,
        skip: number,
        limit: number,
    };

    /** Is this a count operation? */
    private count: boolean;

    /**
     * Constructor
     * @param datastore - Datastore reference
     * @param query - query for search
     * @param count - is this a count operation? Default: false
     */
    constructor(datastore: Datastore, query: any, count?: boolean) {
        this.datastore = datastore;
        this.query = query;
        this.count = count || false;
    }

    /**
     * Sort order for fields
     * @param sort - sort object `{fieldName: 1|-1 ...}`
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
        return new Promise((resolve, reject) => {
            const promises: Array<Promise<string[]>> = [];

            for (const field in this.query) {
                if (this.query.hasOwnProperty(field)) {
                    promises.push(this.datastore.search(field, this.query[field]));
                }
            }

            const joined: Promise<any[] | number> = Promise.all(promises);

            joined
                .then((idsArr: string[][]) => {
                    // Use a Set to dedupe
                    const ids: Set<string> = idsArr
                        .reduce((a, b) => a.concat(b), [])
                        .reduce((set: Set<string>, id): Set<string> => set.add(id), new Set());

                    const arr = Array.from(ids.values());

                    if (this.count) {
                        return arr.length;
                    } else {
                        return this.datastore.getDocs(arr);
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    }
}
