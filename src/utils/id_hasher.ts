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
    const base64Array: string[] = B64.decode(str).split("=");
    base64Array.pop();

    return [
        decodeB64(base64Array[0]),
        decodeB64(base64Array[1]),
        decodeB64(base64Array[2]),
        decodeB64(base64Array[3]),
    ];
};

/**
 * Encodes a ByteBuffer into a Hash
 * @param buffer
 * @returns {string}
 */
export const encode = (buffer: ByteBuffer): string => {
    const base64Array: string[] = buffer.map((u8) => B64.encode(String.fromCharCode.apply(null, u8)));

    return B64.encode(base64Array.join(""));
};

/**
 * Encodes a Hash for a UUID based on date and random numbers
 * @returns {string}
 */
export const getUUID = (): string => {
    const dateBytes: Uint8Array = NumberToByteArray(Date.now());

    return encode([dateBytes, randomByteArray(), randomByteArray(), randomByteArray()]);
};

/**
 * Retrieve the creation Date from the id
 * @param id
 * @returns {Date}
 */
export const getDate = (id: string): Date => {
    let time: number = 0;
    const decoded = decode(id);
    const decodedTime = decoded[0];
    for (let i = decodedTime.length - 1; i >= 0; i--) {
        if ( decodedTime[i - 2] !== undefined ) {
            time = (time + decodedTime[i - 1]) * 256;
        } else if (decodedTime[i - 1] === undefined) {
            time += decodedTime[i];
        }
    }
    return new Date(time);
};

/**
 * Convert base64 into Uint8Array
 * @param b64
 * @returns {Uint8Array}
 */
function decodeB64(b64: string): Uint8Array {
    const decoded = B64.decode(b64).split("").map((c) => c.charCodeAt(0));
    decoded.pop();
    return new Uint8Array(decoded);
}

/**
 * Serializes Long Unsigned Integers into Uint8Arrays
 * @param long
 * @returns {Uint8Array}
 * @constructor
 */
function NumberToByteArray(long: number): Uint8Array {
    // we want to represent the input as an 8-byte array
    const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    for ( let index = 0; index < byteArray.length; index ++ ) {
        const byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return new Uint8Array(byteArray);
}

/**
 * Generate a single Uint8Array representing 2 serialized Long Unsigned Integer.
 * An unsigned long is 4 bytes, 1 byte = 8 bits. 8 bits can create 256 values.
 * @returns {Uint8Array}
 */
function randomByteArray(): Uint8Array {
    const byteArray = [];
    // hex 100 = 256, math random from 0 to 255;
    byteArray.push(Math.floor(Math.random() * (0x100)));
    byteArray.push(Math.floor(Math.random() * (0x100)));
    byteArray.push(Math.floor(Math.random() * (0x100)));
    byteArray.push(Math.floor(Math.random() * (0x100)));
    byteArray.push(Math.floor(Math.random() * (0x100)));
    byteArray.push(Math.floor(Math.random() * (0x100)));
    byteArray.push(Math.floor(Math.random() * (0x100)));
    byteArray.push(Math.floor(Math.random() * (0x100)));

    return new Uint8Array(byteArray);
}
