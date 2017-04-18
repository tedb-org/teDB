/**
 * Created by tsturzl on 4/15/17.
 */

/**
 * Boundaries for lookup
 */
export interface IRange {
    /**
     * Greater Than
     */
    $gt?: any;
    /**
     * Greater Than or Equal
     */
    $gte?: any;
    /**
     * Less Than
     */
    $lt?: any;
    /**
     * Less Than or Equal
     */
    $lte?: any;
}
