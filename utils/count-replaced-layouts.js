const fs = require('fs');
const { each } = require('lodash');

const file = fs.readFileSync('./www/metadata/layouts.json');
const data = JSON.parse(file);

let count = 0;
each(data, lib => {
    each(lib, layout => {
        if (layout.replace) {
            count += 1;
        }
    });
})

console.log(count);