import { Options, PhotosType } from '@types'
import '@/components/favicon'
import './style.css'

const keys = {
  UnsplashPhotoType: 'unsplash.photo.type',
  UnsplashPhotoValue: 'unsplash.photo.value',
  DisplayDateTime: 'datetime.display',
  ClockHoursColor: 'clock.hours.color',
  ClockMinutesColor: 'clock.minutes.color',
} as const

const $form = (() => {
  const form = document.forms[0] as HTMLFormElement

  return {
    [keys.UnsplashPhotoType]: form.elements[
      // @ts-ignore: TS thinks we can only access
      // `form.elements` with a number. It's wrong. We can use strings.
      keys.UnsplashPhotoType
    ] as HTMLSelectElement,
    [keys.UnsplashPhotoValue]: form.elements[
      // @ts-ignore
      keys.UnsplashPhotoValue
    ] as HTMLInputElement,
    [keys.DisplayDateTime]: form.elements[
      // @ts-ignore
      keys.DisplayDateTime
    ] as HTMLInputElement,
    [keys.ClockHoursColor]: form.elements[
      // @ts-ignore
      keys.ClockHoursColor
    ] as HTMLInputElement,
    [keys.ClockMinutesColor]: form.elements[
      // @ts-ignore
      keys.ClockMinutesColor
    ] as HTMLInputElement,
  }
})()

const defaults: Options = {
  [keys.UnsplashPhotoType]: 'collection',
  [keys.UnsplashPhotoValue]: 'yvLAh9Xk5B4',
  [keys.DisplayDateTime]: true,
  [keys.ClockHoursColor]: '#1e90ff', // dodgerblue
  [keys.ClockMinutesColor]: '#ff1493', // deeppink
}

const resetButton = document.getElementById('reset')

resetButton?.addEventListener('click', async () => {
  await chrome.storage.sync.clear()

  location.reload()
})

async function setUnsplashPhotoTypeValue(photoType: PhotosType) {
  const unsplashPhotoValueLabel = document.getElementById(
    'unsplash.photo.value.label',
  )!

  switch (photoType) {
    case 'search':
      unsplashPhotoValueLabel.textContent = 'Search term'
      $form['unsplash.photo.value'].placeholder = 'e.g. nature'
      break
    case 'topic':
      unsplashPhotoValueLabel.textContent = 'Topic ID or name'
      $form['unsplash.photo.value'].placeholder = 'e.g. wallpapers'
      break
    case 'user':
      unsplashPhotoValueLabel.textContent = 'Username'
      $form['unsplash.photo.value'].placeholder = 'e.g. naoufal'
      break
    default:
      unsplashPhotoValueLabel.textContent = 'Collection ID'
      $form['unsplash.photo.value'].placeholder = 'e.g. yvLAh9Xk5B4'
      break
  }
}

const settings = {
  [keys.UnsplashPhotoType]: {
    // @ts-ignore
    el: $form[keys.UnsplashPhotoType],
    event: 'change',
    async handleEvent() {
      const targetValue = $form['unsplash.photo.type'].value

      await chrome.storage.sync.set({
        [keys.UnsplashPhotoType]: targetValue,
        [keys.UnsplashPhotoValue]: '',
      })

      await setUnsplashPhotoTypeValue(targetValue as PhotosType)
    },
  },
  [keys.UnsplashPhotoValue]: {
    // @ts-ignore
    el: $form[keys.UnsplashPhotoValue],
    event: 'input',
  },
  [keys.DisplayDateTime]: {
    // @ts-ignore
    el: $form[keys.DisplayDateTime],
    value: 'checked',
    event: 'change',
  },
  [keys.ClockHoursColor]: {
    // @ts-ignore
    el: $form[keys.ClockHoursColor],
    event: 'input',
  },
  [keys.ClockMinutesColor]: {
    el: $form[keys.ClockMinutesColor],
    event: 'input',
  },
}

function defaultHandler(key: string, value: () => string) {
  return function handleEvent() {
    chrome.storage.sync.set({
      [key]: value(),
    })
  }
}

chrome.storage.sync.get(defaults, async (options: Options) => {
  for (const key in settings) {
    const setting = settings[key as keyof typeof settings]
    const valueProp = 'value' in setting ? setting.value : 'value'

    // @ts-ignore
    setting.el[valueProp] = options[key as keyof Options]

    // @ts-ignore
    const handler =
      'handleEvent' in setting
        ? setting.handleEvent
        : // @ts-ignore
          defaultHandler(key, () => setting.el[valueProp])

    setting.el.addEventListener(setting.event, handler)
  }

  await setUnsplashPhotoTypeValue(options['unsplash.photo.type'])
})
