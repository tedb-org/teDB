import * as BTT from "binary-type-tree";
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
