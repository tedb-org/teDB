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

export class MockStorageDriver implements IStorageDriver {

    public getItem(key: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve();
        });
    }

    public setItem(key: string, value: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve("a");
        });
    }

    public removeItem(key: string): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            resolve();
        });
    }

    public iterate(iteratorCallback: (value: any, key: string, iteratorNumber: number) => any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve();
        });
    }

    public keys(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            resolve();
        });
    }

    public clear(): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            resolve();
        });
    }
}
