import { css } from '@/utils/cis'
import { Options, PhotosType, UnsplashPhoto } from '@types'
import debounce from 'debounce'

const style = document.createElement('style')

type UnsplashOptions = Pick<
  Options,
  'unsplash.photo.type' | 'unsplash.photo.value'
>

class EpicUnsplash extends HTMLElement {
  img = document.createElement('img')
  attrib = document.createElement('span')
  data: UnsplashPhoto | null = null

  get options(): UnsplashOptions {
    return {
      'unsplash.photo.type': this.getAttribute('key') as PhotosType,
      'unsplash.photo.value': this.getAttribute('value') as string,
    }
  }

  async connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.shadowRoot?.append(style, this.img, this.attrib)

    this.data = (await fetchData(this.options)) ?? null

    if (!this.data) {
      console.error(`Failed to fetch data from the API!`)

      return
    }

    this.createAttrib()
    this.sizeImage()

    globalThis.addEventListener('resize', () => {
      const backgroundColor = this.data?.color ?? 'white'

      this.img.style.opacity = '0'

      document.body.style.backgroundColor = backgroundColor
    })

    globalThis.addEventListener(
      'resize',
      debounce(this.sizeImage.bind(this), 200),
    )
  }

  sizeImage() {
    if (this.data?.url) {
      const src = addResizeParams(this.data.url)

      this.img.src = ''
      this.img.onload = () => {
        this.img.style.opacity = '1'
      }

      this.img.src = src
    }
  }

  createAttrib() {
    const unsplashLink = document.createElement('a')

    unsplashLink.href = createUnsplashLink()
    unsplashLink.innerText = 'Unsplash'

    const photographerLink = document.createElement('a')

    if (this.data?.author) {
      photographerLink.href = createUnsplashLink(this.data.author.link)
      photographerLink.innerText = this.data.author.name
    }

    this.attrib.append(
      document.createTextNode('Photo by '),
      photographerLink,
      document.createTextNode(' on '),
      unsplashLink,
    )
  }
}

style.textContent = css`
  :host {
    display: block;
    position: fixed;
    inset: 0;
  }

  img {
    position: absolute;
    inset: 0;

    transition: opacity 200ms;
  }

  a {
    color: currentColor;
  }

  span {
    color: white;
    opacity: 0.8;
    line-height: normal;
    position: absolute;
    bottom: 0;
    left: 0;
    margin: 1rem;
    font-size: 0.88em;
    transition: opacity 200ms;
    animation: appear 600ms 250ms both;

    &:hover {
      opacity: 1;
    }
  }

  @keyframes appear {
    from {
      opacity: 0;
    }
  }
`

type CachedImage = {
  expires: number
  data: UnsplashPhoto
}

/**
 * Fetches an Unsplash Photo resource from our API. Will
 * return cached data if available.
 * @param options API Options
 * @returns An UnsplashPhoto or undefined (in the event of
 * an error in the Response)
 */
async function fetchData(
  options: UnsplashOptions,
): Promise<UnsplashPhoto | undefined> {
  const cache = localStorage.getItem('cache')

  if (cache) {
    const parsed = JSON.parse(cache) as CachedImage

    if (parsed.expires > Date.now()) {
      return parsed.data
    }
  }

  const url = new URL(import.meta.env.PUBLIC_PROXY_URL)
  const params = new URLSearchParams(options)
  const req = new Request(`${url}?${params}`)
  const res = await fetch(req)
  const expires = Date.now() + Number(import.meta.env.PUBLIC_CACHE_TTL) * 1000
  const cached: CachedImage = {
    expires,
    data: await res.json(),
  }

  localStorage.setItem('cache', JSON.stringify(cached))

  return cached.data
}

/**
 * Creates a link back to Unsplash, specific to this
 * extension
 * @param host The Unsplash host
 * @returns The link string
 */
function createUnsplashLink(host: string = 'https://unsplash.com') {
  const url = new URL(host)
  const params = new URLSearchParams({
    utm_source: 'spring',
    utm_medium: 'referral',
  })

  return `${url}?${params}`
}

/**
 * Creates an image URL with parameters that resize the
 * image based on the browser's current viewport. Keeps any
 * image parameters already in the URL.
 * @param url The Unsplash image URL
 * @returns A new Unsplash URL
 */
function addResizeParams(url: string) {
  const params = new URLSearchParams({
    fit: 'crop',
    w: String(globalThis.innerWidth),
    h: String(globalThis.innerHeight),
  })

  if (url.includes('?')) {
    return `${url}&${params}`
  }

  return `${url}?${params}`
}

customElements.define('epic-unsplash', EpicUnsplash)
