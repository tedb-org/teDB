import * as BTT from "binary-type-tree";
/**
 * Boundaries for lookup
 */
export interface IRange {
    /**
     * Greater Than
     */
    $gt?: BTT.ASNDBS;
    /**
     * Greater Than or Equal
     */
    $gte?: BTT.ASNDBS;
    /**
     * Less Than
     */
    $lt?: BTT.ASNDBS;
    /**
     * Less Than or Equal
     */
    $lte?: BTT.ASNDBS;
    /**
     * Not Equal to
     */
    $ne?: any;
}
/**
 * Argument for index options.
 */
export interface IindexOptions {
    /**
     * The path to the field to be indexed.
     */
    fieldName: string;
    /**
     * Set the index to unique or not
     */
    unique?: boolean;
    /**
     * Method used within the AVL Bt  ree
     * (a: any, b: any ) => number;
     */
    compareKeys?: BTT.compareKeys;
    /**
     * Method used within the AVL Btree
     * (a: ASNDBS, b: ASNDBS ) => boolean;
     */
    checkKeyEquality?: BTT.checkKeyEquality;
}

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
