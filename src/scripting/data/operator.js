export const OperatorOpcode = [
    { opcode: 0x00, command: '==', callback: (b, a) => a === b },
    { opcode: 0x01, command: '>', callback: (b, a) => a > b },
    { opcode: 0x02, command: '<', callback: (b, a) => a < b },
    { opcode: 0x03, command: '>=', callback: (b, a) => a >= b },
    { opcode: 0x04, command: '<=', callback: (b, a) => a <= b },
    { opcode: 0x05, command: '!=', callback: (b, a) => a !== b }
];
