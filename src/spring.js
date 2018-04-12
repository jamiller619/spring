import {h} from 'jsx-dom'

import './js/epic-unsplash'
import './js/date-time'
import './js/clock'
import './spring.scss'

const colors = {
  minute: '#f53a88',
  minuteHand: '#ffa0e1',
  marker: '#f3a6a6',
  hour: '#6813aa',
  dial: '#201e21',
  dialBorder: '#511c5f'
}

const App = () => {
  return [
    <epic-unsplash class="unsplash" update-frequency="daily" />,
    <date-time class="digital" />,
    <ziiiro-clock class="analog" {...colors} />
  ]
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.createDocumentFragment()
  const app = <App />

  app.forEach(node => container.appendChild(node))

  document.body.appendChild(container)
})
