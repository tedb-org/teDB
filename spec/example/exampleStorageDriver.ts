/**
 *  Written on Mac,
 *  Sierra -v 10.12.5
 *  Node -v 7.10.0
 *  This is the mock storage driver for TeDB/node. This will read/write
 *  to the /teDB/spec/example/db directory using Nodejs fs library.
 *  Check the /teDB/spec/example/exampleStorageDriver.ts file for
 *  full explanation.
 */
import { IStorageDriver } from "../../src";
import * as fs from "fs";
import ErrnoException = NodeJS.ErrnoException;

export class MockStorageDriver implements IStorageDriver {
    private filePath: string;
    private allKeys: string[];

    constructor(filePath: string) {
        this.filePath = filePath;
        this.allKeys = [];
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
                        if (doc._id === key) {
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
                this.allKeys.push(key);
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
                parsedData.pop();
                for (let i = parsedData.length - 1; i >= 0; i--) {
                    try {
                        const doc = JSON.parse(parsedData[i]);
                        if (doc._id === key) {
                            parsedData.splice(i, 1);
                        }
                    } catch (e) {
                        reject(e);
                    }
                }
                fs.unlinkSync(`${cwd}/spec/example/db/${this.filePath}.db`);
                for (let i = 0; i <= parsedData.length; i++) {
                    try {
                        if (parsedData[i] !== undefined) {
                            const json = JSON.stringify(JSON.parse(parsedData[i])) + "\n";
                            fs.appendFileSync(`${cwd}/spec/example/db/${this.filePath}.db`, json);
                        }
                    } catch (e) {
                        reject(e);
                    }
                }
                for (let i = this.allKeys.length - 1; i >= 0; i--) {
                    if (this.allKeys[i].indexOf(key) === 0) {
                        this.allKeys.splice(i, 1);
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
            const cwd = process.cwd();
            const fileName = `BTTindex_${this.filePath}_${key}.db`;
            fs.writeFile(`${cwd}/spec/example/db/${fileName}`, index, (err: ErrnoException) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
    /**
     * using the cwd, the file path and the key name to create
     * a string that will find the correct file. Then read the contents
     * and return the the stores JSON
     */
    public fetchIndex(key: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const cwd = process.cwd();
            const fileName = `BTTindex_${this.filePath}_${key}.db`;
            let index: any;
            fs.readFile(`${cwd}/spec/example/db/${fileName}`, "utf8", (err: ErrnoException, data) => {
                if (err) {
                    reject(err);
                }
                try {
                    index = JSON.parse(data);
                } catch (e) {
                    reject(e);
                }
                resolve(index);
            });
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
        return new Promise<string[]>((resolve) => {
            resolve(this.allKeys);
        });
    }
    /**
     * unlink file, if associated index files also unlink
     */
    public clear(): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            const cwd = process.cwd();
            fs.unlink(`${cwd}/spec/example/db/${this.filePath}.db`, (error: ErrnoException) => {
                if (error) {
                    return reject(error);
                }
                fs.readdir(`${cwd}/spec/example/db`, (err: ErrnoException, files: string[]) => {
                    files.map((file) => {
                        const splitFile: string[] = file.split("_");
                        if (splitFile[1] === this.filePath) {
                            fs.unlink(`${cwd}/spec/example/db/${file}`, (er: ErrnoException) => {
                                if (er) {
                                    return reject(er);
                                }
                            });
                        }
                    });
                });
            });
            this.allKeys = [];
        });
    }
}
