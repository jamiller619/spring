export default class Unsplash {
  constructor(updateFrequency, customUrl) {
    this.url = customUrl || this.getImageURL(updateFrequency)
  }

  getImageURL(updateFrequency) {
    const winWidth = window.innerWidth
    const winHeight = window.innerHeight
    const freq = updateFrequency || ''

    return `https://source.unsplash.com/featured/${winWidth}x${winHeight}/${
      freq
    }`
  }

  render() {
    const container = document.createElement('div')
    let image = new Image()

    container.className = 'background'

    image.onload = () => {
      container.style.backgroundImage = `url(${this.url})`
    }

    image.src = this.url
    return container
  }
}
