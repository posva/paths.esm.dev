'use strict';

const ENC = {
  '+': '-',
  '/': '_',
  '=': '.',
}
const DEC = {
  '-': '+',
  _: '/',
  '.': '=',
}

/**
 * encode base64 string url safe
 * @param base64 - base64 encoded string
 * @return url-safe-base64 encoded
 */
const safeEncode = (base64: string) => {
  return base64.replace(/[+/=]/g, m => ENC[m])
}

/**
 * decode url-safe-base64 string to base64
 * @param safe - url-safe-base64 string
 * @return base64 encoded
 */
const safeDecode = (safe: string) => {
  return safe.replace(/[-_.]/g, m => DEC[m])
}

/**
 * trim padding - `window.atob` might handle trimmed strings, e.g. in Chrome@57, Firefox@52
 * @param string - base64 or url-safe-base64 string
 * @return string with padding chars removed
 */
export const trim = (string: string) => {
  return string.replace(/[.=]{1,2}$/, '')
}

/**
 * checks if `string` is base64 encoded
 * @param string
 * @return true if base64 encoded
 */
export const isBase64 = (string: string) =>
  /^[A-Za-z0-9+/]*[=]{0,2}$/.test(string)

/**
 * checks if `string` is url-safe-base64 encoded
 * @param string
 * @return true if url-safe-base64 encoded
 */
export const isUrlSafeBase64 = (string: string) =>
  /^[A-Za-z0-9_-]*[.]{0,2}$/.test(string)

/* \
|*|
|*|  Base64 / binary data / UTF-8 strings utilities (#1)
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
|*|
|*|  Author: madmurphy
|*|
\ */

/* Array of bytes to base64 string decoding */

function b64ToUint6 (nChr) {

  return nChr > 64 && nChr < 91 ?
      nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
    : nChr > 47 && nChr < 58 ?
      nChr + 4
    : nChr === 43 ?
      62
    : nChr === 47 ?
      63
    :
      0;

}

function base64DecToArr (sBase64, nBlockSize) {

  var
    sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
    nOutLen = nBlockSize ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockSize) * nBlockSize : nInLen * 3 + 1 >>> 2, aBytes = new Uint8Array(nOutLen);

  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
      }
      nUint24 = 0;
    }
  }

  return aBytes;
}

/* Base64 string to array encoding */

function uint6ToB64 (nUint6) {

  return nUint6 < 26 ?
      nUint6 + 65
    : nUint6 < 52 ?
      nUint6 + 71
    : nUint6 < 62 ?
      nUint6 - 4
    : nUint6 === 62 ?
      43
    : nUint6 === 63 ?
      47
    :
      65;

}

function base64EncArr (aBytes) {

  var eqLen = (3 - (aBytes.length % 3)) % 3, sB64Enc = "";

  for (var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
    nMod3 = nIdx % 3;
    /* Uncomment the following line in order to split the output in lines 76-character long: */
    /*
    if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
    */
    nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
    if (nMod3 === 2 || aBytes.length - nIdx === 1) {
      sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
      nUint24 = 0;
    }
  }

  return  eqLen === 0 ?
      sB64Enc
    :
      sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");

}

export function encode(data: string): string {
  const aUTF16CodeUnits = new Uint16Array(data.length)
  for (let i = 0; i < aUTF16CodeUnits.length; i++) {
    aUTF16CodeUnits[i] = data.charCodeAt(i)
  }
  return safeEncode(base64EncArr(new Uint8Array(aUTF16CodeUnits.buffer)))
}

export function decode(data: string): string {
  return String.fromCharCode.apply(
    null,
  // @ts-ignore
    new Uint16Array(base64DecToArr(safeDecode(data), 2).buffer)
  )
}
