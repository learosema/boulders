import { h, fragment, renderTree } from '../utils/jsx-factory';

export class GameMenu extends HTMLElement {

  static register() {
    customElements.define('game-menu', GameMenu);
  }

  gameMenu: HTMLDialogElement|null = null;
  menuButton: HTMLButtonElement|null = null;
  closeButton: HTMLButtonElement|null = null;
  selectRenderer: HTMLSelectElement|null = null;

  render() {
    const currentURL = document.location.href;
    renderTree(this,
      <>
        <button class="burger" aria-controls="gameMenu"> 
          <svg viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="14" height="3" />
            <rect x="1" y="6" width="14" height="3" />
            <rect x="1" y="11" width="14" height="3" />
          </svg>
          <span class="v-hidden">
            open menu
          </span>
        </button>
        <dialog class="game-menu flow" id="gameMenu">
          <h2>Menu</h2>
          <form method="dialog">
            <button id="buttonReturnToGame" class="button">Return to game</button>
          </form>
          <a href={currentURL} class="button">Restart game</a>
          <div class="field">
            <label for="selectRenderer">Renderer</label>
            <select class="select" id="selectRenderer">
              <option value="canvas2d">Canvas2D</option>
              <option value="webgl" selected>WebGL</option>
              <option value="webgpu">WebGPU</option>
            </select>
          </div>
          <a href="/" class="button">Back to main menu</a>
        </dialog>  
      </>
    );
  }


  connectedCallback() {
    this.render();
    this.menuButton = this.querySelector<HTMLButtonElement>('.burger')!;
    this.gameMenu = this.querySelector<HTMLDialogElement>('.game-menu')!;
    this.closeButton = this.querySelector<HTMLButtonElement>('#buttonReturnToGame')!;
    this.selectRenderer = this.querySelector<HTMLSelectElement>('#selectRenderer')!;
    this.menuButton.addEventListener('click', this.onClickButton);
    this.closeButton.addEventListener('click', this.onCloseMenu);
    this.selectRenderer.addEventListener('input', this.onSelectRenderer);
  }

  disconnectedCallback() {
    this.menuButton?.removeEventListener('click', this.onClickButton);
    this.closeButton?.removeEventListener('click', this.onCloseMenu);
    this.selectRenderer?.removeEventListener('input', this.onSelectRenderer);
    this.innerHTML = '';
  }

  onClickButton = () => this.gameMenu?.showModal();

  onCloseMenu = () => {
    setTimeout(() => document.querySelector('canvas')?.focus(), 0);
  }

  closeMenu() {
    this.gameMenu?.close();
    this.onCloseMenu();
  }

  onSelectRenderer = () => {
    const game = window.document.querySelector('boulders-game');
    game?.setAttribute('engine', this.selectRenderer?.value || 'canvas2d');
    this.closeMenu();
  }

}
