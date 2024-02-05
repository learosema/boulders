# Boulders - A Boulder Dash Clone

This is a basic clone of the Boulder Dash clone, originally built by [Peter Liepa](https://brainjam.ca). The game mechanics are roughly implemented from what I've had in memory.
It is a demo/research project for a couple of web platform technologies, frameworks and methodologies I'm interested in and love to work with.

## Technologies

- [Eleventy](https://11ty.dev)
- [TypeScript](https://typescriptlang.org)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [esbuild](https://esbuild.github.io/)
- [lightningcss](https://lightningcss.dev/)
- Web Audio API. A microlibrary dropped out of this: [https://retro-sound.js.org](https://retro-sound.js.org)
- JSX without React: I've written a bit about that [Custom JSX in TypeScript](https://lea.codes/posts/2024-01-17-custom-jsx-in-typescript/)
- Different Rendering Engines and changing them on-the-fly while in-game: WebGL, WebGPU, Canvas2D
- GLSL and WGSL shaders
- Building game mechanics incrementally via test-driven development
- some basic Software Architecture principles, some SOLID but mostly "loose coupling" and depending on interfaces rather than implementations
- "isomorphic TypeScript": The Canvas2D renderer used in the Frontend is re-used in Eleventy/node.js to generate preview images.
- ASCII art maps: the levels are plain text files with [ASCII art maps](https://github.com/learosema/boulders/blob/main/src/level/01.txt), processed by Eleventy

## Talk 

I held a talk about the project at the [NovaSummit 2023](https://youtu.be/rsf0hTE4--0). 

There are also [slides](https://boulders-slides.netlify.app/). The Slides are also made with Eleventy. The source is available on [GitHub](https://github.com/learosema/boulders-slides).

## License

- Code: [LICENSE](LICENSE.md)
- Artwork: CC-BY-SA 4.0

