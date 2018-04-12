import {h} from 'jsx-dom'

const Container = ({name}) => {
  return (
    <div class={`${name}-container`}>
      <div class={name} />
    </div>
  )
}

const Face = ({size}) => {
  const markers = []
  for (let i = 0; i < 12; i++) {
    const distance = size / 2 * 0.75
    const angle = i * 360 / 12
    const markerStyle = {
      transform: `rotate(${angle}deg) translate(${distance}px)`
    }
    markers.push(<div class="marker" style={markerStyle} />)
  }

  return <div class="face">{markers}</div>
}

const Dial = () => <div class="dial" />
const MinutesContainer = () => <Container name="minutes" />
const HoursContainer = () => <Container name="hours" />
const MinuteHandContainer = () => <Container name="minute-hand" />

window.customElements.define(
  'ziiiro-clock',
  class extends HTMLElement {
    connectedCallback() {
      this.renderContent()
      window.requestAnimationFrame(this.render.bind(this))
    }

    render() {
      this.renderTime(new Date())
      window.requestAnimationFrame(this.render.bind(this))
    }

    renderContent() {
      const container = document.createDocumentFragment()
      const size = this.offsetWidth

      this.$content = {
        face: <Face size={size} />,
        dial: <Dial />,
        minutes: <MinutesContainer />,
        hours: <HoursContainer />,
        minuteHand: <MinuteHandContainer />
      }

      Object.values(this.$content).forEach(node => container.appendChild(node))

      this.applyColors().appendChild(container)
    }

    applyColors() {
      const {
        minute,
        minuteHand,
        hour,
        dial,
        dialBorder,
        marker
      } = this.attributes
      const content = this.$content
      const applyToFirstChild = (element, key, value) => {
        element.firstChild.style[key] = value
      }

      applyToFirstChild(content.minutes, 'backgroundColor', minute.value)
      applyToFirstChild(content.minuteHand, 'backgroundColor', minuteHand.value)
      applyToFirstChild(content.hours, 'backgroundColor', hour.value)

      content.dial.style.backgroundColor = dial.value
      content.dial.style.borderColor = dialBorder.value
      content.face.style.color = marker.value

      return this
    }

    renderTime(time) {
      const {minutes, minuteHand, hours} = this.$content
      const degrees = this.getClockAngles(time)

      minutes.style.transform = minuteHand.style.transform = `rotate(${
        degrees.minute
      }deg)`
      hours.style.transform = `rotate(${degrees.hour}deg)`
    }

    getClockAngles(date) {
      const d = date || new Date()
      const minutes = (d.getSeconds() / 60 + d.getMinutes()) / 60
      const hours = (d.getHours() + d.getMinutes() / 60) / 12
      return {
        minute: (minutes * 360) % 360,
        hour: (hours * 360) % 360
      }
    }
  }
)
