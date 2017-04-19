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
     * Iterate every key-value pair,
     * IterationCallback should return truthy to break iteration(resulting in promise resolution)
     * IterationCallback should throw exceptions if error occurs, this will be caught by the promise and propogate up
     * the promise chain and handled accordingly. TODO: Add Error types for StorageDrivers
     *
     * @param iteratorCallback - Function to iterate key values pairs, return truthy to break iteration
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
