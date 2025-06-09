import { Options } from '@types'
import pThrottle from 'p-throttle'

const throttle = pThrottle({
  limit: 1,
  interval: 1000,
})

export default function bind<K extends keyof Options>(
  key: K,
  handler: (value: Options[K]) => void,
) {
  const throttled = throttle(handler)

  chrome.storage?.onChanged.addListener((changes) => {
    if (key in changes) {
      throttled(changes[key].newValue)
    }
  })

  chrome.storage?.sync.get(key, (options: Options) => {
    throttled(options[key])
  })
}
