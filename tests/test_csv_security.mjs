import assert from 'node:assert/strict';
import {encodeCsvCell,encodeCsvRows} from '../js/services/csv.js';
assert.equal(encodeCsvCell('=HYPERLINK("http://bad.invalid")'), '"\'=HYPERLINK(""http://bad.invalid"")"');
for (const cell of ['+SUM(A1:A2)','-1+2','@SUM(A1:A2)','  =1+1','\t=1+1']){
  assert(encodeCsvCell(cell).startsWith('"\''),`Unescaped spreadsheet formula: ${cell}`);
}
assert.equal(encodeCsvCell(-10),'"-10"');
assert(encodeCsvRows([['note'],['=1+2']]).includes('"\'=1+2"'));
console.log('PASS CSV formula injection controls and numerical fidelity');
