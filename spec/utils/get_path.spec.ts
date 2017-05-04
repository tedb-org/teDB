import { getPath } from "../../src/utlis";

test("retrieving key from document", () => {
    const doc = {
        name: "Charles Xavier",
        age: 78,
        occupation: "Professor",
        students: [
            "Wolverine",
            "Blue Falcon",
            "Chad",
        ],
        nested: {
            name: "sneaky",
        },
    };

    const key: string = getPath(doc, "name");
    const numKey: number = getPath(doc, "age");
    const defKey: boolean = getPath(doc, "never", false);
    const missingKey: any = getPath(doc, "lost");
    const students: string[] = getPath(doc, "students");
    const nested: string = getPath(doc, "nested.name");

    expect(key).toBe("Charles Xavier");
    expect(numKey).toBe(78);
    expect(defKey).toBe(false);
    expect(missingKey).toBe(undefined);
    expect(students).toEqual(expect.arrayContaining(["Wolverine", "Blue Falcon", "Chad"]));
    expect(nested).toBe("sneaky");
});
