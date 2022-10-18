// Get a random integer between two values, inclusive -- via MDN docs
// The maximum is inclusive and the minimum is inclusive
export function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

