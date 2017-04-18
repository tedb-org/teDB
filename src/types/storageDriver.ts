/**
 * Created by tsturzl on 4/15/17.
 */

/**
 * Pluggable Storage Drivers
 * You can create plugins for TeDB to provide different mediums of storage. Below you'll find methods that TeDB will
 * expect in your plugin. Storage plugins implement a simple key-value store.
 */
export interface IStorageDriver {
    /**
     * Get item by key
     * @param key
     */
    getItem(key: string): Promise<any>;
    /**
     * Insert or Modify key-value pair
     * @param key
     * @param value
     */
    setItem(key: string, value: any): Promise<any>;
    /**
     * Remove item by key
     * @param key
     */
    removeItem(key: string): Promise<null>;
    /**
     * Iterate every key-value pair, returns non-undefined to break iteration
     * @param iteratorCallback - Function(value: any, key: string, interatorNumber: number)
     */
    iterate(iteratorCallback: (value: any, key: string, iteratorNumber: number) => any): Promise<any>;
    /**
     * Retrieve all keys
     */
    keys(): Promise<string[]>;
    /**
     * Clear the entire database
     */
    clear(): Promise<null>;
}
