import * as BTT from "binary-type-tree";

/**
 * Boundaries for lookup
 *
 * Array String Number, Date, Boolean, -> symbol was redacted. : Used for keys
 * BTT.ASNDBS = Array<any[]|string|number|Date|boolean|null>|string|number|Date|boolean|null
 * -> redacted symbol, Number, Date, Boolean, String, Array : Used for values
 * BTT.SNDBSA = Array<{}|any[]|string|number|Date|boolean|null>;
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
 *
 * Array String Number, Date, Boolean, -> symbol was redacted. : Used for keys
 * BTT.ASNDBS = Array<any[]|string|number|Date|boolean|null>|string|number|Date|boolean|null
 * -> redacted symbol, Number, Date, Boolean, String, Array : Used for values
 * BTT.SNDBSA = Array<{}|any[]|string|number|Date|boolean|null>;
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
     *
     * ~~~
     * (a: any, b: any ) => number;
     * ~~~
     * BTT.compareKeys
     * ~~~
     * compareKeys = (a: number | string, b: number | string): number => {
     *   if (a < b) {
     *      return -1;
     *   } else if (a > b) {
     *      return 1;
     *   } else if (a === b) {
     *      return 0;
     *   } else {
     *      throw new Error();
     *   }
     * ~~~
     */
    compareKeys?: BTT.compareKeys;
    /**
     * Method used within the AVL Btree
     * ~~~
     * (a: ASNDBS, b: ASNDBS ) => boolean;
     * ~~~
     * BTT.checkKeyEquality
     * ~~~
     * checkKeyEquality = (a: number | string | Date, b: number | string | Date): boolean => {
     *      return a === b;
     * }
     * ~~~
     */
    checkKeyEquality?: BTT.checkKeyEquality;
}

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
