import {h} from 'jsx-dom'

import './epic-unsplash'
import './date-time'
import './ziiiro-clock'
import '../spring.scss'

const colors = {
  minute: '#f53a88',
  minuteHand: '#ffa0e1',
  marker: '#f3a6a6',
  hour: '#6813aa',
  dial: '#201e21',
  dialBorder: '#511c5f'
}

const app = [
  <epic-unsplash class="unsplash" update-frequency="daily" />,
  <date-time class="digital" />,
  <ziiiro-clock class="analog" {...colors} />
]

document.body.append(...app)
