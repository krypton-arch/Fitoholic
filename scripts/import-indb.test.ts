import test from 'node:test';
import assert from 'node:assert';
import { parseNutrientValue, parseCompoundName } from './import-indb';

test('parseNutrientValue handles various inputs correctly', () => {
  // Tr / tr should map to 0
  assert.strictEqual(parseNutrientValue('Tr'), 0);
  assert.strictEqual(parseNutrientValue('tr'), 0);
  
  // N, NA, na, -, empty should map to null
  assert.strictEqual(parseNutrientValue('N'), null);
  assert.strictEqual(parseNutrientValue('NA'), null);
  assert.strictEqual(parseNutrientValue('na'), null);
  assert.strictEqual(parseNutrientValue('-'), null);
  assert.strictEqual(parseNutrientValue(''), null);
  assert.strictEqual(parseNutrientValue('  '), null);
  
  // Null or undefined
  assert.strictEqual(parseNutrientValue(null), null);
  assert.strictEqual(parseNutrientValue(undefined), null);

  // Valid numbers
  assert.strictEqual(parseNutrientValue('10.5'), 10.5);
  assert.strictEqual(parseNutrientValue('15'), 15);
  assert.strictEqual(parseNutrientValue(15), 15);
  assert.strictEqual(parseNutrientValue(' 12.3  '), 12.3);
  
  // Numbers mixed with text or spaces (if any basic cleanup is needed)
  assert.strictEqual(parseNutrientValue('10.5g'), 10.5); // The regex handles replacement
});

test('parseCompoundName handles compound and simple names correctly', () => {
  assert.deepStrictEqual(parseCompoundName('Poha (Flattened rice)'), { 
    name: 'Poha', 
    alias: 'Flattened rice' 
  });
  
  assert.deepStrictEqual(parseCompoundName('Apple'), { 
    name: 'Apple', 
    alias: null 
  });
  
  assert.deepStrictEqual(parseCompoundName('  Mango (Aam)  '), { 
    name: 'Mango', 
    alias: 'Aam' 
  });
  
  assert.deepStrictEqual(parseCompoundName(''), { 
    name: 'Unknown', 
    alias: null 
  });
  
  assert.deepStrictEqual(parseCompoundName(null as any), { 
    name: 'Unknown', 
    alias: null 
  });
});
