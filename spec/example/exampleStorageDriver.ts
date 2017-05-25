/**
 *  Written on Mac,
 *  Sierra -v 10.12.5
 *  Node -v 7.10.0
 *  This is the mock storage driver for TeDB. This will read/write
 *  to the /teDB/spec/example/db directory using Nodejs fs library.
 *  Check the /teDB/spec/example/exampleStorageDriver.ts file for
 *  full explanation.
 */
import { IStorageDriver } from "../../src";
import * as fs from "fs";
import ErrnoException = NodeJS.ErrnoException;

export class MockStorageDriver implements IStorageDriver {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    /**
     * using the cwd use the file path to read the file contents
     * parse the file and return the item with the given key
     * else reject a new error message.
     */
    public getItem(key: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const cwd = process.cwd();
            fs.readFile(`${cwd}/spec/example/db/${this.filePath}.db`, "utf8", (err: ErrnoException, data) => {
                if (err) {
                    return reject(err);
                }
                const parsedData = data.split("\n");
                for (let i = parsedData.length - 2; i >= 0; i--) {
                    try {
                        const doc = JSON.parse(parsedData[i]);
                        if (doc.id === key) {
                            resolve(doc);
                        }
                    } catch (e) {
                        reject(e);
                    }
                }
                resolve(null);
            });
        });
    }
    /**
     * using the cwd use the filepath to write to the file
     * given the key send the data
     * else reject a new error message.
     */
    public setItem(key: string, value: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const cwd = process.cwd();
            let data;
            try {
                data = JSON.stringify(value) + "\n";
            } catch (e) {
                reject(e);
            }

            fs.appendFile(`${cwd}/spec/example/db/${this.filePath}.db`, data, (err: ErrnoException) => {
                if (err) {
                    reject(err);
                }
                resolve(value);
            });
        });
    }
    /**
     * This is only for testing
     * using the cwd the file path read in the file convert
     * the file to an object remove he proposed obj and
     * rewrite the file.
     */
    public removeItem(key: string): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            const cwd = process.cwd();
            fs.readFile(`${cwd}/spec/example/db/${this.filePath}.db`, "utf8", (err: ErrnoException, data) => {
                if (err) {
                    return reject(err);
                }
                const parsedData = data.split("\n");
                for (let i = parsedData.length - 2; i >= 0; i--) {
                    try {
                        const doc = JSON.parse(parsedData[i]);
                        if (doc.id === key) {
                            parsedData.splice(i, 1);
                        }
                    } catch (e) {
                        reject(e);
                    }
                }
                parsedData.pop();
                fs.unlinkSync(`${cwd}/spec/example/db/${this.filePath}.db`);
                for (let i = 0; i <= parsedData.length; i++) {
                    try {
                        const json = JSON.stringify(JSON.parse(parsedData[i])) + "\n";
                        fs.appendFileSync(`${cwd}/spec/example/db/${this.filePath}.db`, json);
                    } catch (e) {
                        reject(e);
                    }
                }
                resolve(null);
            });
        });
    }

    /**
     * using the cwd, the file path and the key name create a file
     * name that represents a reference to the associated database file,
     * a reference to the associated object element.
     * example Obj: { "name": "fred", "internal": { "age": 33 } }
     * example filename: BTTindex_users_internal-age.db
     * where the file path of the associated index is "users" and the key
     * given in the method is the path to the element indexed "internal.age".
     */
    public storeIndex(key: string, index: string): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            resolve();
        });
    }
    /**
     * using the cwd, the file path and the key name to create
     * a string that will find the correct file. Then read the contents
     * and return the the stores JSON
     */
    public fetchIndex(key: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve();
        });
    }
    /**
     *
     */
    public iterate(iteratorCallback: (key: string, value: any, iteratorNumber: number) => any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve();
        });
    }
    /**
     * ?
     */
    public keys(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            resolve();
        });
    }
    /**
     * unlink file, if associated index files also unlink
     */
    public clear(): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            const cwd = process.cwd();
            try {
                fs.unlinkSync(`${cwd}/spec/example/db/${this.filePath}.db`);
            } catch (e) {
                reject(e);
            }
            resolve(null);
        });
    }
}
