/// <reference lib="DOM" />
import bind from '@/options/bind'

import '@/components/EpicUnsplash.ts'
import '@/components/DateTime.js'
import '@/components/ZiiiroClock.ts'
import '@/components/Options.ts'
import '@/components/favicon.ts'

const ziiiroClock = document.querySelector('ziiiro-clock')
const epicUnsplash = document.querySelector('epic-unsplash')

bind('clock.hours.color', (color) => {
  ziiiroClock?.setAttribute('hour', color)
})

bind('clock.minutes.color', (color) => {
  ziiiroClock?.setAttribute('minute', color)
})

bind('unsplash.photo.type', (type) => {
  epicUnsplash?.setAttribute('key', type)
})

bind('unsplash.photo.value', (value) => {
  epicUnsplash?.setAttribute('value', value)
})
