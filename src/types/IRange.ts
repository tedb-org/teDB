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
