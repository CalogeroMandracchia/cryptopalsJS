const range = require('rangex');

const prova = [ [1,2,3], [4,5,6], [7,8,9], [10, 11, 12], [13, 14]];
console.log("prova", prova);
const transposed= [];
for(const index of range(prova[0].length)) {
    const temp = []
    for(const array of prova) {
        if(array[index]) {
            temp.push((array[index]));
        }
    }
    transposed.push(temp);
}
console.log("tr", transposed);