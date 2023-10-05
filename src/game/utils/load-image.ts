export function loadImage(url: string|HTMLImageElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = typeof url === "string" ? url : url.src;
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
}
