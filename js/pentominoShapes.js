// pentominoShapes.js
// Standard Pentominoes: F, I, L, N, P, T, U, V, W, X, Y, Z
// Each shape is a 5-block configuration.

export const SHAPES = {
    F: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 1, 0]
    ],
    I: [
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0]
    ],
    L: [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0]
    ],
    N: [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0]
    ],
    P: [
        [0, 1, 1],
        [0, 1, 1],
        [0, 1, 0]
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0]
    ],
    U: [
        [1, 0, 1],
        [1, 1, 1]
    ],
    V: [
        [0, 0, 1],
        [0, 0, 1],
        [1, 1, 1]
    ],
    W: [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 1]
    ],
    X: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
    ],
    Y: [
        [0, 0, 1, 0],
        [1, 1, 1, 1]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ]
};

// Nimbus Pastel Palette
export const COLORS = {
    F: "#fca5a5", // pastel red
    I: "#86efac", // pastel green
    L: "#fdba74", // pastel orange
    N: "#93c5fd", // pastel blue
    P: "#f9a8d4", // pastel pink
    T: "#c4b5fd", // pastel purple
    U: "#bef264", // pastel lime
    V: "#fde047", // pastel yellow
    W: "#5eead4", // pastel teal
    X: "#cbd5e1", // pastel slate
    Y: "#d8b4fe", // pastel violet
    Z: "#fb7185"  // pastel rose
};
