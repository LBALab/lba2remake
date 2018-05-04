function test(a) {
    return {
        /* @inspector(locate, pure) */
        x() {
            return 42 + a;
        }
    };
}

console.log(test(0).x);
console.log(test(0).x());
