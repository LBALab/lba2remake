function test(a) {
    return {
        x() {
            return 42 + a;
        }
    };
}

test(0);
