/**
 * Need type ASNDBS which is the type used for keys in the
 * binary-type-tree, stands for Array of any, string number, Date, Boolean, symbol and null and
 * none array of all. Shown below.
 * Array<any[]|string|number|Date|boolean|symbol|null>|string|number|Date|boolean|symbol|null
 */
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
