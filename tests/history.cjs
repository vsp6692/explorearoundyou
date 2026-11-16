const assert=require('node:assert/strict');const {searchRecord,preferences}=require('../.test-output/history.js');
assert.deepEqual(searchRecord('  Chennai  '),{query:'Chennai',category:null});
assert.equal(searchRecord('x'.repeat(300),'Food').query.length,200);
assert.equal(searchRecord('test','inferred religion').category,null);
assert.deepEqual(preferences([{category:'Food'},{category:'Parks'},{category:'Food'},{category:null},{category:'private'}]),[{category:'Food',count:2},{category:'Parks',count:1}]);
console.log('PASS: bounded explicit history, supported-category counts, no inferred sensitive traits');
