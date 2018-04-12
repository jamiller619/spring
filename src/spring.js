import {h} from 'jsx-dom'

import './js/epic-unsplash'
import './js/date-time'
import './js/clock'
import './spring.scss'

const colors = {
  minute: '#f12176',
  minuteHand: '#fff',
  marker: '#fff',
  hour: '#924aef',
  dial: '#373c58',
  dialBorder: '#fff'
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
