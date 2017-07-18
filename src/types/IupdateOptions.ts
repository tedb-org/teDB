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
}
