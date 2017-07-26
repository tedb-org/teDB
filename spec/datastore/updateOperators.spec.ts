import { $set, $inc, $mul, $unset, $rename } from "../../src/updateOperators";

describe("testing the update operators", () => {
    const testObject = {
        _id: "123456789",
        username: "chickenSteak",
        password: "abc123#hashed",
        nested: {
            layer1: "start",
            layer2: {
                mul: 2,
                inc: 3,
                dec: 4,
                rename: "forgotten",
                unset: "mispelled",
            },
        },
    };

    test("successful $set", () => {
        expect.assertions(2);
        return $set(testObject, {"username": "chickenFried", "nested.layer1": "end"})
            .then((res) => {
                expect(res.username).toEqual("chickenFried");
                expect(res.nested.layer1).toEqual("end");
            });
    });

    test("failing $set", () => {
        expect.assertions(1);
        return $set(testObject, {})
            .catch((err) => expect(err).toEqual(new Error("Empty $set object")));
    });

    test("successful $mul", () => {
        expect.assertions(1);
        return $mul(testObject, {"nested.layer2.mul": 2})
            .then((res) => expect(res.nested.layer2.mul).toEqual(4));
    });

    test("failing $mul", () => {
        expect.assertions(1);
        return $mul(testObject, {})
            .catch((e) => expect(e).toEqual(new Error("Empty $mul object")));
    });

    test("successful $inc", () => {
        expect.assertions(2);
        return $inc(testObject, {"nested.layer2.inc": 1})
            .then((res) => {
                expect(res.nested.layer2.inc).toEqual(4);
                return $inc(testObject, {"nested.layer2.inc": -3});
            })
            .then((res) => {
                expect(res.nested.layer2.inc).toEqual(1);
            });
    });

    test("failing $inc", () => {
        expect.assertions(1);
        return $inc(testObject, {})
            .catch((e) => expect(e).toEqual(new Error("Empty $inc object")));
    });

    test("successful $unset", () => {
        expect.assertions(2);
        return $unset(testObject, {"nested.layer2.unset": ""})
            .then((res) => {
                expect(res.nested.layer2.unset).toEqual(undefined);
                return $unset(testObject, {password: ""});
            })
            .then((res) => {
                expect(res.password).toEqual(undefined);
            });
    });

    test("failing $unset", () => {
        expect.assertions(1);
        return $unset(testObject, {})
            .catch((e) => expect(e).toEqual(new Error("Empty $unset object")));
    });

    test("successful $rename", () => {
        expect.assertions(2);
        return $rename(testObject, {"nested.layer2.rename": "Mr", "nested": "deep"})
            .then((res) => {
                expect(res.deep.layer2.Mr).toEqual("forgotten");
                expect(res.deep).toEqual({"layer1": "end", "layer2": {Mr: "forgotten", dec: 4, inc: 1, mul: 4}});
            });
    });

    test("failing $rename", () => {
        expect.assertions(1);
        return $rename(testObject, {})
            .catch((e) => expect(e).toEqual(new Error("Empty $rename object")));
    });
});
