import { loadImage } from "./load-image";

describe('loadImage function', () => {

  // data-URL of a transparent pixel.
  const DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  it('loads an image', async () => {
    const image = await loadImage(DATA_URL);
    expect(image).toBeInstanceOf(HTMLImageElement);
    expect(image.width).toBe(1);
    expect(image.height).toBe(1);
  });
});

