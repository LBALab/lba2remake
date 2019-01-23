export const OperatorOpcode = [
    { opcode: 0x00, command: '==', handler: (b, a) => a === b },
    { opcode: 0x01, command: '>', handler: (b, a) => a > b },
    { opcode: 0x02, command: '<', handler: (b, a) => a < b },
    { opcode: 0x03, command: '>=', handler: (b, a) => a >= b },
    { opcode: 0x04, command: '<=', handler: (b, a) => a <= b },
    { opcode: 0x05, command: '!=', handler: (b, a) => a !== b }
];
