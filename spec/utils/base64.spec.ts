import Base64 from "../../src/utils";

describe("testing base64", () => {
    const B64 = new Base64();
    test("encode", () => {
        const coded = B64.encode("abc123");

        expect(coded).toEqual("YWJjMTIz");
    });

    test("decode", () => {
        const coded = B64.encode("abc123");
        const decoded = B64.decode(coded);

        expect(decoded).toEqual("abc123");
    });
});
