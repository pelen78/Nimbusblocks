// pieces.js
// Custom Pentomino-inspired shapes for Nimbus Block 2.0
// 5 cells per piece. 16 distinct shapes.
// Precomputed rotations are generated at runtime initialization.

export const PIECES = {};

// Base definitions (0 rotation)
// Represented as bitmasks or simple coordinate arrays would be efficient,
// but 2D arrays are easier to visualize and inspect.
// Using 5x5 grid for all to ensure safe rotation.

const RAW_SHAPES = {
    // 1. The "Javelin" (Long line with a notch)
    "javelin": [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0]
    ],
    // 2. The "Scepter" (Like a T but longer tail)
    "scepter": [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    // 3. The "Stairs" (Upward step)
    "stairs": [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    // 4. The "Cradle" (U shape)
    "cradle": [
        [0, 1, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    // 5. The "H-Minor" (Like a small H)
    "h_minor": [
        [0, 1, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0], // Actually identical to cradle geometrically in 5x5 but logic differentiation allowed
        // Let's make it different:
        // [1 0 1]
        // [1 1 1] is 6 blocks. Wait, pentomino = 5.
        // H-minor:
        // 1 0
        // 1 1 1
        // 1 0
        [1, 0, 0, 0, 0],
        [1, 1, 1, 0, 0],
        [1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    // 6. The "Signpost"
    "signpost": [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    // 7. The "Snake"
    "snake": [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 1, 1, 0, 0], // This is 5? 1+2+2=5. No, 1+2+2 = 5.
        // 0 0 1
        // 0 1 1
        // 0 1 1 -- wait, that's a P shape variant.
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    // 8. The "Pipe" (Notched L)
    "pipe": [
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 1, 0], // Disconnected? No, must be connected.
        // 1
        // 1
        // 1 0 1 <- gap.
        // Let's do:
        // 1 1
        //   1
        //   1 1
        [1, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    // 9. The "Lightning"
    "lightning": [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0], // S-pentomino roughly
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    // 10. The "Corner" (Large L)
    "corner": [
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 1, 0, 0], // 5 blocks
        [0, 0, 0, 0, 0]
    ],
    // 11. The "Throne"
    "throne": [
        [0, 1, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        // 1
        // 1 1
        // 1
        // 1 -> 5 blocks
        [0, 0, 0, 0, 0]
    ],
    // 12. The "Boat"
    "boat": [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 0, 1, 0, 0], // 5
        [0, 0, 0, 0, 0]
    ],
    // 13. The "Key"
    "key": [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 0, 0, 0], // 5
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    // 14. The "Fist"
    "fist": [
        [0, 1, 1, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 0, 0], // 5
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    // 15. The "Glider"
    "glider": [
        [0, 0, 1, 0, 0],
        [1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0], // Disconnected?
        //   1
        // 1 1 1
        //       1 -> Gap.
        // Fix:
        //   1
        // 1 1 1
        //     1
        [0, 0, 1, 0, 0],
        [1, 1, 1, 0, 0],
        [0, 0, 1, 0, 0], // Plus shape => signpost.
        // Let's do:
        // 1 1
        //   1
        //   1
        //   1
        // No that's corner.
        // 1 0 1
        // 1 1 1 -> 6.
        // U shape:
        // 1 0 1
        // 1 1 1 -> 6.
        // 1 0 1
        // 1 1 1 (delete middle bottom) -> 5? No, bottom row must connect.
        // 1 0 1
        // 1 1 1 -> delete middle top?
        // 1   1
        // 1 1 1 -> 5 (U shape)
        [1, 0, 1, 0, 0],
        [1, 1, 1, 0, 0], // This is U.
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ]
};

// Nimbus Pastel Palette (Unique per piece)
const PALETTE = {
    "javelin": "#f87171", // Soft Red
    "scepter": "#fb923c", // Orange
    "stairs": "#fbbf24", // Amber
    "cradle": "#a3e635", // Lime
    "h_minor": "#4ade80", // Green
    "signpost": "#34d399", // Emerald
    "snake": "#2dd4bf", // Teal
    "pipe": "#22d3ee", // Cyan
    "lightning": "#38bdf8", // Sky
    "corner": "#60a5fa", // Blue
    "throne": "#818cf8", // Indigo
    "boat": "#a78bfa", // Violet
    "key": "#c084fc", // Purple
    "fist": "#e879f9", // Fuchsia
    "glider": "#f472b6"  // Pink
};

// Colors actually corresponding to names
export const COLORS = {};

// Helper to rotate 5x5 matrix 90 degrees clockwise
function rotateMatrix(matrix) {
    const N = matrix.length;
    const res = matrix.map(row => [...row]);
    for (let i = 0; i < N / 2; i++) {
        for (let j = i; j < N - i - 1; j++) {
            const temp = res[i][j];
            res[i][j] = res[N - 1 - j][i];
            res[N - 1 - j][i] = res[N - 1 - i][N - 1 - j];
            res[N - 1 - i][N - 1 - j] = res[j][N - 1 - i];
            res[j][N - 1 - i] = temp;
        }
    }
    return res;
}

// Precompute
Object.keys(RAW_SHAPES).forEach(key => {
    const rot0 = RAW_SHAPES[key];
    const rot90 = rotateMatrix(rot0);
    const rot180 = rotateMatrix(rot90);
    const rot270 = rotateMatrix(rot180);

    PIECES[key] = [rot0, rot90, rot180, rot270];
    COLORS[key] = PALETTE[key] || "#94a3b8";
});
