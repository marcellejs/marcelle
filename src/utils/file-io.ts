export async function saveBlob(
  data: string | ArrayBuffer,
  name: string,
  type: string,
): Promise<void> {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  const blob = new Blob([data], { type });
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}

// export async function readJsonFile(inputFile) {
//   const temporaryFileReader = new FileReader();
//   return new Promise((resolve, reject) => {
//     temporaryFileReader.onerror = () => {
//       temporaryFileReader.abort();
//       reject(new DOMException('Problem parsing input file.'));
//     };

//     temporaryFileReader.onload = () => {
//       resolve(JSON.parse(temporaryFileReader.result));
//     };
//     temporaryFileReader.readAsText(inputFile);
//   });
// }
