import { h, fragment, renderTree } from '../utils/jsx-factory';

export class WonMenu extends HTMLElement {

  static observedAttributes = ['open'];

  get open(): boolean {
    return this.hasAttribute('open');
  }

  set open(value: boolean) {
    this.setAttribute('open', '');
  }

  attributeChangedCallback(name: string) {
    if (name === 'open') {
      if (this.open) {
        this.openMenu();
      } else {
        this.closeMenu();
      }
    }
  }

  get nextLevel() {
    return this.getAttribute('data-url-next-level')
  }

  static register() {
    customElements.define('won-menu', WonMenu);
  }

  wonMenu: HTMLDialogElement|null = null;
  menuButton: HTMLButtonElement|null = null;
  selectRenderer: HTMLSelectElement|null = null;

  render() {
    const currentURL = document.location.href;
    renderTree(this,
      <>
        <dialog class="game-menu flow">
          <h2>You Won!</h2>
          {this.nextLevel && <a href={this.nextLevel} class="button">Next Level</a>}
          <a href={currentURL} class="button">Restart game</a>
          <a href="/" class="button">Back to main menu</a>
        </dialog>  
      </>
    );
  }

  connectedCallback() {
    this.render();
    this.wonMenu = this.querySelector('dialog');
  }

  disconnectedCallback() {
    this.innerHTML = '';
  }

  openMenu() {
    this.wonMenu?.showModal(); 
  }

  closeMenu() {
    this.wonMenu?.close();
    setTimeout(() => document.querySelector('canvas')?.focus(), 0);
  }
}
