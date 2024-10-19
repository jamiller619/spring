const style = document.createElement('style')

style.textContent = /*css*/ `
  .image {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50%;
  }
`

export default class EpicUnsplash extends HTMLElement {
  baseURL = 'api.unsplash.com/photos/random'
  image = document.createElement('div')
  imageURL = null
  color = null
  author = {
    name: null,
    link: null,
  }
  size = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  constructor() {
    super()

    this.createShadow()
    this.fetchData()
  }

  createShadow() {
    const shadow = this.attachShadow({ mode: 'open' })

    this.image.className = 'image'

    shadow.append(style, this.image)
  }

  get utm() {
    return `utm_source=spring&utm_medium=referral`
  }

  get updateFrequency() {
    return this.hasAttribute('update-frequency')
      ? this.getAttribute('update-frequency')
      : 'daily'
  }

  getURL() {
    const url = new URL(this.baseURL)
    url.searchParams.set('client_id', this.accessKey)

    return url.toString()
  }

  async fetchData() {
    try {
      const req = await fetch(this.getURL())
      const data = await req.json()

      this.imageURL = data.urls.full

      this.author.name = data.user.name
      this.author.link = data.user.links.self

      this.color = data.color
    } catch (e) {
      console.error(e)
    }
  }

  attribute() {
    const wrapper = document.createElement('div')
    const photographerLink = document.createElement('a')

    if (this.author.link && this.author.name) {
      photographerLink.href = `${this.author.link}?${this.utm}`
      photographerLink.innerText = this.author.name
    }

    const unsplashLink = document.createElement('a')

    unsplashLink.href = `https://unsplash.com/?${this.utm}`
    unsplashLink.innerText = 'Unsplash'

    wrapper.appendChild(document.createTextNode('Photo by '))
    wrapper.appendChild(photographerLink)
    wrapper.appendChild(document.createTextNode(' on '))
    wrapper.appendChild(unsplashLink)
  }

  async render() {}
}
