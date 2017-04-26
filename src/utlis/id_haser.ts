import Base64 from "./base64";

/**
 * Tuple of 4 Uint8Arrays representing 4 serialized Long Unsigned Integers
 */
export type ByteBuffer = [Uint8Array, Uint8Array, Uint8Array, Uint8Array];

const B64 = new Base64();

/**
 * Decodes the Hash into a ByteBuffer
 * @param str
 * @returns {ByteBuffer}
 */
export const decode = (str: string): ByteBuffer => {
    const base64Array: string[] = B64.decode(str).split("-");

    const buffer: ByteBuffer = [
        decodeB64(base64Array[0]),
        decodeB64(base64Array[1]),
        decodeB64(base64Array[2]),
        decodeB64(base64Array[3]),
    ];

    return buffer;
};

/**
 * Encodes a ByteBuffer into a Hash
 * @param buffer
 * @returns {string}
 */
export const encode = (buffer: ByteBuffer): string => {
    const base64Array: string[] = buffer.map((u8) => B64.encode(String.fromCharCode.apply(null, u8)));

    return B64.encode(base64Array.join("-"));
};

/**
 * Encodes a Hash for a UUID based on date and random numbers
 * @returns {string}
 */
export const getUUID = (): string => {
    const dateBytes = NumberToByteArray(Date.now());
    return encode([dateBytes, radomByteArray(), radomByteArray(), radomByteArray()]);
};

/**
 * Convert base64 into Uint8Array
 * @param b64
 * @returns {Uint8Array}
 */
function decodeB64(b64: string): Uint8Array {
    return new Uint8Array(B64.decode(b64).split("").map((c) => c.charCodeAt(0)));
}

/**
 * Serializes Long Unsigned Integers into Uint8Arrays
 * @param long
 * @returns {Uint8Array}
 * @constructor
 */
function NumberToByteArray(long: number): Uint8Array {
    // we want to represent the input as a 8-bytes array
    const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for ( let index = 0; index < byteArray.length; index ++ ) {
        const byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return new Uint8Array(byteArray);
}

/**
 * Generate a single Uint8Array representing a serialized Long Unsigned Integer
 * @returns {Uint8Array}
 */
function radomByteArray(): Uint8Array {
    const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    byteArray.push(Math.floor(Math.random() * (0 - 0x100)));
    byteArray.push(Math.floor(Math.random() * (0 - 0x100)));
    byteArray.push(Math.floor(Math.random() * (0 - 0x100)));
    byteArray.push(Math.floor(Math.random() * (0 - 0x100)));
    byteArray.push(Math.floor(Math.random() * (0 - 0x100)));
    byteArray.push(Math.floor(Math.random() * (0 - 0x100)));
    byteArray.push(Math.floor(Math.random() * (0 - 0x100)));
    byteArray.push(Math.floor(Math.random() * (0 - 0x100)));

    return new Uint8Array(byteArray);
}
