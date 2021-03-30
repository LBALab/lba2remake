
// LBA2PointOffsets is a map from scene ID to Point ID to desired position offset.
// This allows us to selectively change specific problematic points.
export const LBA2PointOffsets = {
    2: {
        // Let Twinsen exit the Trulu cave.
        13: [0, 0, 0.5],
    },
    49: {
        // Ensure Twinsen+Zoe don't clip into the next scene when walking to the lighthouse.
        15: [-0.5, 0, 0],
    },
    46: {
        // Ensure Twinsen+Zoe can enter the lighthouse.
        6: [0, 0, 0.5],
    },
};
