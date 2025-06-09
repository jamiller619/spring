import conic from '@/assets/conic'
import { html } from '@/utils/cis'

const template = document.createElement('template')

template.innerHTML = html`
  <svg
    id="clock"
    width="16"
    height="16"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    style="position: relative">
    <foreignObject width="100" height="100">
      <div
        id="hour"
        xmlns="http://www.w3.org/1999/xhtml"
        style="background-color: deeppink"></div>
      <div
        id="minute"
        xmlns="http://www.w3.org/1999/xhtml"
        style="background-color: dodgerblue"></div>
      <div
        id="background"
        xmlns="http://www.w3.org/1999/xhtml"
        style="background-color: white"></div>
    </foreignObject>
    <!-- Center point -->
    <circle cx="50" cy="50" r="22" fill="black" />
    <style>
      #clock #hour,
      #clock #minute {
        position: absolute;
        inset: 0;
        clip-path: circle();
        mix-blend-mode: multiply;
        background-image: url(${conic});
      }

      #clock #background {
        position: absolute;
        inset: 0;
        clip-path: circle();
        mix-blend-mode: soft-light;
      }
    </style>
  </svg>
`

render()

setInterval(render, 1000 * 30) // 30 seconds

function render() {
  const hourHand = template.content.getElementById('hour')!
  const minuteHand = template.content.getElementById('minute')!

  const now = new Date()
  const seconds = now.getSeconds()
  const minutes = now.getMinutes()
  const hours = now.getHours() % 12

  const minuteAngle = (minutes / 60) * 360 + (seconds / 60) * 6
  const hourAngle = (hours / 12) * 360 + (minutes / 60) * 30

  minuteHand.style.rotate = `${minuteAngle}deg`
  hourHand.style.rotate = `${hourAngle}deg`

  const str = new XMLSerializer().serializeToString(template.content)
  const decoded = decodeURI(str)
  const b64 = btoa(decoded)
  const imgsrc = `data:image/svg+xml;base64,${b64}`

  const head = document.querySelector('head')
  const link = document.createElement('link')

  link.setAttribute('rel', 'shortcut icon')
  link.setAttribute('href', imgsrc)

  const curlink = document.querySelector('link[rel="shortcut icon"]')

  if (curlink) {
    curlink.replaceWith(link)
  } else {
    head?.append(link)
  }
}
