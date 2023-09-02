import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CanvasRenderer } from './canvas-renderer';
import { parseHTML } from 'linkedom';

describe('Canvas Renderer', () => {
  let window, document: Document;

  beforeEach(() => {
    const DOM = parseHTML(`
      <!doctype html>
      <html lang="en">
        <head>
          <title>Test environment</title>
        </head>
        <body>
        </body>
      </html>
    `);

    window = DOM.window;
    document = DOM.document;
  })

  it('should instantiate', () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    assert.equal(!!(new CanvasRenderer(canvas)), true);
  });
});
