import { decode, getUUID, ByteBuffer, getDate } from "../../src/utlis";

describe("testing the id_hasher", () => {
    const id: string = getUUID();

    test("decode", () => {
        const buffer: ByteBuffer = decode(id);

        expect(buffer).toHaveLength(4);
        buffer.map((arr) => expect(arr).toBeInstanceOf(Uint8Array));
        buffer.map((arr) => arr.forEach((num) => expect(num.constructor).toBe(Number)));
    });

    test("getting Date from id", () => {
        const now = getDate(id);

        expect(now).toBeInstanceOf(Date);
    });
});
