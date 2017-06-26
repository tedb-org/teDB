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
        const cwd = process.cwd();
        if (!fs.existsSync(`${cwd}/spec/example/db/${this.filePath}`)) {
            fs.mkdirSync(`${cwd}/spec/example/db/${this.filePath}`);
        }
    }

    /**
     * using the cwd use the file path to read the file contents
     * parse the file and return the item with the given key
     * else reject a new error message.
     */
    public getItem(key: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const cwd = process.cwd();
            fs.readFile(`${cwd}/spec/example/db/${this.filePath}/${key}.db`, "utf8", (err: ErrnoException, data: string) => {
                if (err) {
                    return reject(err);
                }
                resolve(JSON.parse(data));
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
                data = JSON.stringify(value);
            } catch (e) {
                reject(e);
            }

            fs.appendFile(`${cwd}/spec/example/db/${this.filePath}/${key}.db`, data, (err: ErrnoException) => {
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
            fs.unlink(`${cwd}/spec/example/db/${this.filePath}/${key}.db`, (err: ErrnoException) => {
                if (err) {
                    return reject(err);
                }
                try {
                    for (let i = this.allKeys.length - 1; i >= 0; i--) {
                        if (this.allKeys[i].indexOf(key) === 0) {
                            this.allKeys.splice(i, 1);
                        }
                    }
                } catch (e) {
                    return reject(e);
                }
                resolve();
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
            const fileName = `${this.filePath}/index_${key}.db`;
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
            const fileName = `${this.filePath}/index_${key}.db`;
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
     * Need to have a collection scan. Go over every file in the directory
     * get the Id, pull the dock out an put into iteratorCallback for each file.
     */
    public iterate(iteratorCallback: (key: string, value: any, iteratorNumber?: number) => any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const cwd = process.cwd();
            fs.readdir(`${cwd}/spec/example/db/${this.filePath}`, (err: ErrnoException, files) => {
                if (err) {
                    return reject(err);
                }
                for (let i = files.length - 1; i >= 0; i--) {
                    try {
                        const data = fs.readFileSync(`${cwd}/spec/example/db/${this.filePath}/${files[i]}`).toString();
                        if (data) {
                            const doc = JSON.parse(data);
                            if (doc.hasOwnProperty("_id")) {
                                iteratorCallback(doc, doc._id);
                            }
                        }
                    } catch (e) {
                        return reject(e);
                    }
                }
                resolve();
            });
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
            fs.readdir(`${cwd}/spec/example/db/${this.filePath}`, (err: ErrnoException, files) => {
                if (err) {
                    return reject(err);
                }
                for (let i = files.length - 1; i >= 0; i--) {
                    try {
                        fs.unlinkSync(`${cwd}/spec/example/db/${this.filePath}/${files[i]}`);
                    } catch (e) {
                        return reject(e);
                    }
                }
                fs.rmdir(`${cwd}/spec/example/db/${this.filePath}`, (error: ErrnoException) => {
                    if (error) {
                        return reject(error);
                    }
                    this.allKeys = [];
                    resolve();
                });
            });
        });
    }
}
