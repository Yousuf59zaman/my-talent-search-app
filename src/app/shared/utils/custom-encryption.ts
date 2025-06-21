const _0xad3d: string[] = [
  'split',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  '',
  'charCodeAt',
  'fromCharCode',
  'length',
  'join',
  'map',
  'reverse',
  'slice'
];

(function (_0x4b4c7a: string[], _0xad3d42: number): void {
  const _0x5d4c3d = function (_0x1a8f7d: number): void {
    while (--_0x1a8f7d) {
      _0x4b4c7a.push(_0x4b4c7a.shift()!);
    }
  };
  _0x5d4c3d(++_0xad3d42);
})(_0xad3d, 0x1a4);

const _0x5d4c = function (_0x4b4c7a: number, _0xad3d42?: number): string {
  _0x4b4c7a = _0x4b4c7a - 0x0;
  const _0x5d4c3d: string = _0xad3d[_0x4b4c7a]!;
  return _0x5d4c3d;
};

export function encrypt(data: any): string {
  // Convert non-string data to string using JSON.stringify
  let input: string = typeof data === 'string' ? data : JSON.stringify(data);
  // Percent-encode to handle all Unicode
  let encoded = encodeURIComponent(input);
  // XOR each char and reverse
  let xored = Array.from(encoded)
    .map(c => String.fromCharCode(c.charCodeAt(0) ^ 0x42))
    .reverse()
    .join('');
  return xored;
}

export function decrypt(encrypted: string): any {
  // Reverse and XOR each char
  let decoded = Array.from(encrypted)
    .reverse()
    .map(c => String.fromCharCode(c.charCodeAt(0) ^ 0x42))
    .join('');
  // Percent-decode
  let result: string;
  try {
    result = decodeURIComponent(decoded);
  } catch {
    result = '';
  }
  try {
    return JSON.parse(result);
  } catch {
    if (result === 'true') return true;
    if (result === 'false') return false;
    if (!isNaN(Number(result)) && result.trim() !== '') return Number(result);
    return result;
  }
}

// Example usage
// const secretMessage: string = "This is a super secret message!";
// const encrypted: string = encrypt(secretMessage);
// console.log("Encrypted:", encrypted);

// const decrypted: string = decrypt(encrypted);
// console.log("Decrypted:", decrypted);