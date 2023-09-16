// kudos to: https://toji.dev/webgpu-best-practices/img-textures.html

export async function textureFromImageBitmap(device: GPUDevice, source: ImageBitmap): Promise<GPUTexture> {
  const textureDescriptor: GPUTextureDescriptor = {
    size: [source.width, source.height],
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.COPY_DST,
  };
  const texture = device.createTexture(textureDescriptor);
  device.queue.copyExternalImageToTexture({ source }, { texture }, textureDescriptor.size);
  return texture;
}

export async function textureFromURL(device: GPUDevice, url: string|URL): Promise<GPUTexture> {
  const response = await fetch(url);
  const blob = await response.blob();
  const imgBitmap = await createImageBitmap(blob);

  return textureFromImageBitmap(device, imgBitmap);
}

export async function textureFromImg(device: GPUDevice, img: HTMLImageElement): Promise<GPUTexture> {
  await img.decode();
  const imgBitmap = await createImageBitmap(img);

  return await textureFromImageBitmap(device, imgBitmap);
}
