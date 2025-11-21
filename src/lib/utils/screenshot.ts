/**
 * Screenshot capture utilities using html2canvas
 * 
 * Note: html2canvas should be dynamically imported to reduce bundle size
 */

export interface ScreenshotOptions {
  quality?: number; // 0-1, default 0.8
  maxWidth?: number; // Max width before compression, default 1920
  maxHeight?: number; // Max height before compression, default 1080
}

/**
 * Capture the current viewport as a screenshot
 */
export const captureScreenshot = async (
  options: ScreenshotOptions = {}
): Promise<string | null> => {
  try {
    // Dynamic import to reduce bundle size
    const html2canvas = (await import("html2canvas")).default;
    
    const { quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = options;

    // Capture the entire viewport
    const canvas = await html2canvas(document.body, {
      allowTaint: true,
      useCORS: true,
      logging: false,
      width: window.innerWidth,
      height: window.innerHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      x: window.scrollX,
      y: window.scrollY,
    });

    // Resize if needed
    let finalCanvas = canvas;
    if (canvas.width > maxWidth || canvas.height > maxHeight) {
      const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
      const resizedCanvas = document.createElement("canvas");
      resizedCanvas.width = canvas.width * scale;
      resizedCanvas.height = canvas.height * scale;
      
      const ctx = resizedCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
        finalCanvas = resizedCanvas;
      }
    }

    // Convert to base64 with quality compression
    return finalCanvas.toDataURL("image/jpeg", quality);
  } catch (error) {
    console.error("Failed to capture screenshot:", error);
    return null;
  }
};

/**
 * Convert base64 data URL to File object
 */
export const dataURLtoFile = (dataURL: string, filename: string): File => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

/**
 * Compress a base64 image string to reduce size
 */
export const compressBase64Image = (
  base64: string,
  maxSizeKB: number = 500
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        resolve(base64);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Start with high quality and reduce if needed
      let quality = 0.9;
      let compressed = canvas.toDataURL("image/jpeg", quality);
      
      // Calculate approximate size in KB
      const sizeKB = (compressed.length * 3) / 4 / 1024;
      
      if (sizeKB > maxSizeKB) {
        // Reduce quality to meet target size
        quality = Math.max(0.5, (maxSizeKB / sizeKB) * quality);
        compressed = canvas.toDataURL("image/jpeg", quality);
      }
      
      resolve(compressed);
    };
    
    img.src = base64;
  });
};
