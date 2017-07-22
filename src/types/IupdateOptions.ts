/**
 * Update Options
 */
export interface IupdateOptions {
    /**
     * default false, if true update many documents
     */
    multi?: boolean;
    /**
     * default false, if true insert the new document
     */
    upsert?: boolean;
    /**
     * default false, if true return all updated documents
     */
    returnUpdatedDocs?: boolean;
    /**
     * used when you want to find a document exactly by the objects
     * contents and if not found insert. different than upsert.
     * With upsert you have to use "dot.notated" and can use $gt queries.
     * with this you can only send and object that you expect to find or
     * insert if not found but only if upsert is set as well. This
     * does not upsert. It just allows you to not use "dot.notated"
     * keys.
     */
    exactObjectFind?: boolean;
}
