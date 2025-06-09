import { Options } from '@types'
import { css, html } from '@/utils/cis'
import getClockAngles from '@/utils/getClockAngles'
import debounce from 'debounce'

const template = html`
  <div id="outline"></div>
  <div id="container">
    <div id="hour"></div>
    <div id="minute"></div>
    <div id="face"></div>
    <div id="minute-marker"></div>
    <div id="center"></div>
  </div>
`

type ClockOptions = Pick<Options, 'clock.hours.color' | 'clock.minutes.color'>

class ZiiiroClock extends HTMLElement {
  template = document.createElement('template')
  hourHand: HTMLElement
  minuteHand: HTMLElement
  minuteMarker: HTMLElement
  face: HTMLElement

  startTime = Date.now()

  static observedAttributes = ['hour', 'minute']

  constructor() {
    super()

    this.template.innerHTML = template

    const { content } = this.template

    this.hourHand = content.getElementById('hour')!
    this.minuteHand = content.getElementById('minute')!
    this.minuteMarker = content.getElementById('minute-marker')!
    this.face = content.getElementById('face')!

    globalThis.addEventListener(
      'resize',
      debounce(this.drawFace.bind(this), 200),
    )
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.setColors()
    this.shadowRoot?.append(style, this.template.content)

    this.drawFace().render()
  }

  attributeChangedCallback() {
    this.setColors()
  }

  setColors() {
    const colors = this.getHandColors()

    this.hourHand.style.background = `conic-gradient(rgb(255 255 255 / 0), ${colors['clock.hours.color']})`
    this.minuteHand.style.background = `conic-gradient(rgb(255 255 255 / 0), ${colors['clock.minutes.color']})`
    this.minuteMarker.style.background = `color-mix(in srgb, ${colors['clock.minutes.color']} 75%, white)`
  }

  getHandColors(): ClockOptions {
    return {
      'clock.hours.color': this.getAttribute('hour')!,
      'clock.minutes.color': this.getAttribute('minute')!,
    }
  }

  render() {
    this.renderTime(new Date())
    requestAnimationFrame(() => this.render())
  }

  renderTime(time: Date) {
    const degrees = getClockAngles(time)

    this.minuteHand.style.rotate = `${degrees.minute}deg`
    this.minuteMarker.style.rotate = `${degrees.minute}deg`
    this.hourHand.style.rotate = `${degrees.hour}deg`

    return this
  }

  drawFace() {
    const markers: HTMLElement[] = []
    const size = this.clientHeight
    const distance = size / 2.75

    for (let i = 0; i < 12; i += 1) {
      const angle = (i * 360) / 12
      const marker = document.createElement('div')

      // We have to use `transform` here because we need to
      // move the marker AFTER rotating it.
      marker.style.transform = `rotate(${angle}deg) translate(${distance}px)`

      markers.push(marker)
    }

    this.face.replaceChildren(...markers)

    return this
  }
}

const style = document.createElement('style')

style.textContent = css`
  :host {
    --color-center: #1a1a1a;
    --color-face: #ffffff9d;

    --ease-bounce: cubic-bezier(0, 0, 0, 1.5);
    --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);

    position: relative;
    border-radius: 50%;
    backdrop-filter: blur(5px);
  }

  #container,
  #outline,
  #minute,
  #hour,
  #center {
    position: absolute;
    inset: 0;
    border-radius: 50%;
  }

  #outline {
    background: rgb(240 240 240 / 0.5);
    outline: 6px solid #1212128f;
    box-shadow: 0 0 25px 7px #00000054;
    animation: appear 400ms 300ms both var(--ease-out);
  }

  #container {
    animation: bounce 300ms var(--ease-out);
    overflow: hidden;
  }

  #hour,
  #minute {
    mix-blend-mode: multiply;
  }

  #minute,
  #minute-marker,
  #hour {
    animation-name: rotate, appear, bounce;
    animation-duration: 1s, 800ms, 300ms;
    animation-timing-function: var(--ease-out), var(--ease-bounce);
  }

  #minute-marker {
    width: 4px;
    height: 52%;
    position: absolute;
    left: 50%;
    bottom: 50%;
    transform-origin: bottom;
  }

  #center,
  #face div {
    animation-name: bounce, appear;
    animation-duration: 500ms;
    animation-delay: 300ms;
    animation-fill-mode: backwards;
    animation-timing-function: var(--ease-bounce);
  }

  #center {
    background: radial-gradient(
      circle at 10% 20%,
      color-mix(in srgb, var(--color-center) 91%, white),
      var(--color-center) 61%
    );
    inset: 26%;
    box-shadow: 0 0 8px 2px #00000080;
  }

  #face {
    div {
      background: var(--color-center);
      position: absolute;
      top: 50%;
      left: 50%;
      width: 1.5%;
      height: 1.5%;
      border-radius: 50%;
      transform-origin: top left;
    }
  }

  @keyframes rotate {
    from {
      rotate: -180deg;
    }
  }

  @keyframes appear {
    from {
      opacity: 0;
    }
  }

  @keyframes bounce {
    from {
      scale: 0;
    }
  }
`

customElements.define('ziiiro-clock', ZiiiroClock)
