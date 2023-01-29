const dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);


export function similarity(a, b) {  
  let magnitudeA = Math.sqrt(dot(a, a));  
  let magnitudeB = Math.sqrt(dot(b, b));  
  if (magnitudeA && magnitudeB)  
    return dot(a, b) / (magnitudeA * magnitudeB);  
  else return false  
}