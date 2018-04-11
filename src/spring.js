import Options from './js/options'
import Unsplash from './js/unsplash'
import Time from './js/time'
import Clock from './js/clock'

import './spring.scss'

const container = document.createDocumentFragment()
const {bgUpdateFreq, bgCustomURL, startTime, colors} = new Options()
const bg = new Unsplash(bgUpdateFreq, bgCustomURL)
const time = new Time(startTime)
const clock = new Clock({
  startDate: startTime,
  size: 31,
  sizeUnits: 'vmin',
  colors: colors
})

container.appendChild(bg.render())
container.appendChild(time.render())
container.appendChild(clock.render())

document.body.appendChild(container)
