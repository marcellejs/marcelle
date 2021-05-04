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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJSONFile(f: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = JSON.parse(reader.result as string);
      resolve(fileContent);
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsText(f);
  });
}
