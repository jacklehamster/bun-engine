import { ProgressiveTextProps } from "./ProgressiveTextProps";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'progressive-text': ProgressiveTextProps;
    }
  }
}

export class ProgressiveText extends HTMLElement {
  readonly #observer;
  #animationFrameRequest = 0;
  #containerText;
  #hiddenText;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    this.#containerText = shadowRoot.appendChild(document.createElement('div'));
    this.#hiddenText = shadowRoot.appendChild(document.createElement('div'));
    this.#hiddenText.style.color = "#00000020";

    this.#observer = new MutationObserver(mutationsList => this.handleMutation(mutationsList));
  }

  connectedCallback() {
    this.childNodes.forEach(node => {
      this.#observer.observe(node, { characterData: true });
      this.startProgressingText(node.textContent ?? "");
    });
  }

  disconnectedCallback() {
    this.#observer.disconnect();
  }

  handleMutation(mutationsList: MutationRecord[]) {
    for (const mutation of mutationsList) {
      if (mutation.type === "characterData") {
        this.startProgressingText(mutation.target.textContent ?? "");
      }
    }
  }

  startProgressingText(text: string) {
    cancelAnimationFrame(this.#animationFrameRequest);
    let period = parseInt(this.getAttribute('period') ?? "10");
    if (isNaN(period)) {
      console.warn("Invalid period: ", period);
      period = 10;
      return;
    }
    let startTime = 0;
    const loop: FrameRequestCallback = time => {
      if (!startTime) {
        startTime = time;
      }
      const numChars = Math.floor((time - startTime) / period);
      const visibleText = text.slice(0, numChars);
      const hiddenText = text.slice(numChars);
      this.#containerText.textContent = visibleText;
      this.#hiddenText.textContent = hiddenText;
      if (numChars <= text.length) {
        requestAnimationFrame(loop);
      }
    };
    this.#animationFrameRequest = requestAnimationFrame(loop);
  }
}

customElements.define('progressive-text', ProgressiveText);
