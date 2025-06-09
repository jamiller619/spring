import icon from '@/assets/settings.svg?raw'
import { css } from '@/utils/cis'

const style = document.createElement('style')

class OptionsPage extends HTMLElement {
  button = document.createElement('button')
  icon!: SVGSVGElement

  connectedCallback() {
    this.attachShadow({ mode: 'open' })

    this.button.innerHTML = icon
    this.shadowRoot!.append(style, this.button)

    this.button.addEventListener('click', this.handleClick.bind(this))
  }

  handleClick() {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    } else {
      window.open('./options/index.html', 'Options', 'width=320,height=600')
      // window.open(chrome.runtime.getURL('options.html'))
    }
  }
}

style.textContent = css`
  :host {
    color: inherit;
  }

  button {
    all: unset;
    background: #000000a3;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    fill: currentColor;
  }
`

globalThis.customElements.define('options-page', OptionsPage)
