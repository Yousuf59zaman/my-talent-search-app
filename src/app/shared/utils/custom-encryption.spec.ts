import { encrypt, decrypt } from './custom-encryption';

describe('custom-encryption', () => {
  it('should encrypt and decrypt a string', () => {
    const input = 'Hello, World!';
    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(input);
  });

  it('should encrypt and decrypt a number', () => {
    const input = 12345;
    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(input);
  });

  it('should encrypt and decrypt an object', () => {
    const input = { foo: 'bar', baz: 42 };
    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toEqual(input);
  });

  it('should encrypt and decrypt an array', () => {
    const input = [1, 2, 3, 'test'];
    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toEqual(input);
  });

  it('should encrypt and decrypt boolean', () => {
    const input = true;
    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(input);
  });

  it('should encrypt and decrypt a deeply nested object', () => {
    const input = {
      a: 1,
      b: 'test',
      c: [1, 2, { d: 'deep', e: [3, 4, { f: true }] }],
      g: { h: { i: { j: 'nested', k: [5, 6, { l: false }] } } }
    };
    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toEqual(input);
  });

  it('should encrypt and decrypt a complex array', () => {
    const input = [
      1,
      'two',
      [3, 4, [5, { six: 6 }]],
      { seven: 7, eight: [8, { nine: 9 }] },
      true,
      null,
      undefined
    ];
    // JSON.stringify turns undefined in arrays into null
    const expected = [
      1,
      'two',
      [3, 4, [5, { six: 6 }]],
      { seven: 7, eight: [8, { nine: 9 }] },
      true,
      null,
      null // <-- match the actual output
    ];
    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toEqual(expected);
  });
});
