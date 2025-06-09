import { css, html } from '@/utils/cis'
import { Options, PhotosType, UnsplashPhoto } from '@types'
import debounce from 'debounce'
import errorIcon from '@/assets/knocked-out_face_3d.png'

const style = document.createElement('style')
const errorStyles = document.createElement('style')

type UnsplashOptions = Pick<
  Options,
  'unsplash.photo.type' | 'unsplash.photo.value'
>

class EpicUnsplash extends HTMLElement {
  img = document.createElement('img')
  attrib = document.createElement('span')
  data: UnsplashPhoto | null = null
  error = html`
    <div class="unsplash-error">
      <img src="${errorIcon}" />
      <h2>Oops! The image failed to load...</h2>
      <p>You can try reloading the page in a moment.</p>
      <p class="msg"></p>
      <button onclick="javascript:window.location.reload(true)">
        Reload page
      </button>
    </div>
  `

  get options(): UnsplashOptions {
    return {
      'unsplash.photo.type': this.getAttribute('key') as PhotosType,
      'unsplash.photo.value': this.getAttribute('value') as string,
    }
  }

  async connectedCallback() {
    try {
      this.data = (await fetchData(this.options)) ?? null
      this.attachShadow({ mode: 'open' })
      this.shadowRoot?.append(style, this.img, this.attrib)

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
    } catch (err) {
      this.attachShadow({ mode: 'open' })

      this.shadowRoot!.innerHTML = this.error

      const el = this.shadowRoot?.querySelector('.msg')
      const msg = document.createTextNode(err?.message)

      el.append(msg)

      this.shadowRoot?.append(style)
    }
  }

  sizeImage() {
    if (this.data?.url) {
      const src = addResizeParams(this.data.url)

      this.img.src = ''
      this.img.classList.add('bg')
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
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: fixed;
    inset: 0;
    background: #222222;
  }

  .unsplash-error {
    align-self: center;
    margin: auto;
    text-align: center;
    color: #dbdbdb;

    img {
      opacity: 0.7;
      width: 50%;
    }

    .msg {
      color: #cd5c5c;
      background: black;
      padding: 1rem;
      border-radius: 5px;

      &::before {
        content: '⚠️';
        margin-inline-end: 3px;
      }
    }

    button {
      all: unset;
      padding-block: 5px;
      padding-inline: 10px;
      border-radius: 7px;
      cursor: pointer;
      background: #87878736;

      &:hover {
        background: rgb(200 200 200 / 0.2);
      }
    }
  }

  .bg {
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

errorStyles.textContent = css`
  .error-container {
    position: fixed;
    inset: 0;
    display: flex;
    width: 100%;
    height: 100%;

    > * {
      flex: 1;
      width: 100%;
      height: 100%;
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
