/**
 * Creates a full-size background image from Unsplash
 */
const style = document.createElement('style')

style.textContent = `
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
}`

window.customElements.define(
  'epic-unsplash',
  class extends HTMLElement {
    constructor() {
      super().createShadow()

      this.size = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }

    createShadow() {
      const shadow = this.attachShadow({mode:'open'})
      this.image = document.createElement('div')

      this.image.className = 'image'

      shadow.append(style, this.image)
    }

    connectedCallback() {
      const img = new Image()
      const url = this.url
      const backgroundImage = `url(${url})`
      const {width, height} = this.size

      img.onload = () => {
        Object.assign(this.image.style, {
          width,
          height,
          backgroundImage
        })
      }
      img.src = url
    }

    get url() {
      const {width, height} = this.size
      const lookupId = (this.hasAttribute('photo-id') && this.getAttribute('photo-id')) || this.photoId || 'featured'
      
      return `https://source.unsplash.com/${lookupId}/${width}x${height}/${this.updateFrequency}`
    }

    get updateFrequency() {
      return this.hasAttribute('update-frequency')
        ? this.getAttribute('update-frequency')
        : 'daily'
    }
  }
)
