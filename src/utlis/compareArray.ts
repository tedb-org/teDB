const isEqual = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length) {
        return false;
    }

    if (a.length === 0) {
        return true;
    }

    const len = a.length;
    let equal = true;

    for (let i = 0; i < len; i++) {
        const x = a[i];
        const y = b[i];

        equal = equal && (x === y);
    }

    return equal;
};

export const compareArray = (a: any[], b: any[]): number => {
    const aStr = a.toString();
    const bStr = b.toString();

    if (isEqual(a, b)) {
        return 0;
    } else if (aStr < bStr) {
        return -1;
    } else if (aStr > bStr) {
        return 1;
    } else {
        throw new Error("Values cannot be compared");
    }
};
