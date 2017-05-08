import { decode, encode, getUUID, ByteBuffer } from "../../src/utlis";

test("a", () => {
    const id: string = getUUID();
    const date: any = new Date(Number(decode(id)[0].reverse().join("")));

    expect(23).toBe(23);
});
