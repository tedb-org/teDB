import { decode, encode, getUUID, ByteBuffer } from "../../src/utlis";


test("a", () => {
    const id: string = getUUID();
    console.log(id);
    const date: any = decode(id)[0].toLocaleString();
    console.log(date);
    expect(date).toBe(23);
});
