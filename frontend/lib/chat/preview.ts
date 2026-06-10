export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not read file for preview."));
    };
    reader.onerror = () => reject(new Error("Could not read file for preview."));
    reader.readAsDataURL(file);
  });
}

export function createLocalPreviewUrl(file: File, messageType: "image" | "voice" | "document"): Promise<string> {
  if (messageType === "image") {
    return readFileAsDataUrl(file);
  }
  if (messageType === "voice") {
    return Promise.resolve(URL.createObjectURL(file));
  }
  return Promise.resolve("");
}

export function revokePreviewUrl(previewUrl: string) {
  if (previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
}
