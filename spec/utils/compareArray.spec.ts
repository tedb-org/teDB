import { compareArray } from "../../src/utlis";

test("compareArray", () => {
    const equal: number = compareArray([1, 2, 3], [1, 2, 3]);
    const greater: number = compareArray(["b"], ["a"]);
    const less: number = compareArray([new Date("1/1/2017")], [new Date()]);

    expect(equal).toBe(0);
    expect(greater).toBe(1);
    expect(less).toBe(-1);
});
