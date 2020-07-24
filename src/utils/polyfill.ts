// Fix typescript compilation bug with ES private fields
// => probably: https://github.com/microsoft/TypeScript/issues/36841
/* eslint-disable */
const g = (0, eval)('this');

g.__classPrivateFieldSet =
  /* @ts-ignore */
  (g && g.__classPrivateFieldSet) ||
  /* @ts-ignore */
  function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
      throw new TypeError('attempted to set private field on non-instance');
    }
    privateMap.set(receiver, value);
    return value;
  };
g.__classPrivateFieldGet =
  /* @ts-ignore */
  (g && g.__classPrivateFieldGet) ||
  /* @ts-ignore */
  function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
      throw new TypeError('attempted to get private field on non-instance');
    }
    return privateMap.get(receiver);
  };
