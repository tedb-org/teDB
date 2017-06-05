const median = (values) => {
    values.sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    if (values.length % 2) {
        return values[half];
    } else {
        return (values[half - 1] + values[half]) / 2.0;
    }
};

const A = {
    point: "A",
    x: 3,
    y: 6,
};
const B = {
    point: "B",
    x: 6,
    y: 7,
};
const C = {
    point: "C",
    x: 11,
    y: 6,
};
const D = {
    point: "D",
    x: 11,
    y: 3,
};
const E = {
    point: "E",
    x: 11,
    y: 2,
};
const F = {
    point: "F",
    x: 4,
    y: 1,
};
const G = {
    point: "G",
    x: 3,
    y: 3,
};
const H = {
    point: "H",
    x: 5,
    y: 4,
};

// distance
// d = sqrt| (x2 - x1)^2 + (y2 - y1)^2
const uecledianD = (point2: any, point1: any) => {
    const x = Math.pow((point2.x - point1.x), 2);
    const y = Math.pow((point2.y - point1.y), 2);
    return Math.abs(Math.sqrt(x + y));
};

describe("rando", () => {
    const Points = [A, B, C, D, E, F, G, H];
    const Start = A;

    /*
    * Need to get the Eucledian distance
    * between each point and plot in matrix
    *  x  A B C D E F G H
    * A   0 2 5 3 3 9 8 1
    * B   2 0
    * C   5   0
    * D   3     0
    * E   3       0
    * F   9         0
    * G   8           0
    * H   1             0
    * */
    const a = [];
    const b = [];
    const c = [];
    const d = [];
    const e = [];
    const f = [];
    const g = [];
    const h = [];
    const matrix = [a, b, c, d, e, f, g, h];
    for (let i = 0; i < matrix.length; i++) {
        for (const point of Points) {
            matrix[i].push(uecledianD(Points[i], point));
        }
    }
    const avgPath = [null, null, null, null, null, null, null, null];
    const shortPath = [null, null, null, null, null, null, null, null];
    const avgPicked = [null, null, null, null, null, null, null, null];
    const shortPicked = [null, null, null, null, null, null, null, null];
    const getAvgPath = () => {
        if (avgPicked[avgPicked.length - 1] === null) {
            for (let x = 0; x < matrix.length - 1; x++) {
                for (let y = 0; y < matrix[x].length; y++) {
                    const original = matrix[y];
                    // remove point 1
                    original.shift();
                    // remove zeros
                    const zeroFilter = original.filter((item) => item !== 0);
                    const med = median(zeroFilter);
                    console.log(med);
                    console.log(zeroFilter);
                }
            }
        } else {
            // select point 1 position
        }
    };
    getAvgPath();
   /* const getShortPath = () => {
        if (shortPath.length < Points.length) {
            for (let x = 0; x < matrix.length; x++) {
                for (let y = 0; y < matrix[y].length; y++) {

                }
            }
        }
    };*/

    test("h", () => { console.log("done")});
});
