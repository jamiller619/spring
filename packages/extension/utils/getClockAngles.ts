export default function getClockAngles(date: Date = new Date()) {
  const minutes = (date.getSeconds() / 60 + date.getMinutes()) / 60
  const hours = (date.getHours() + date.getMinutes() / 60) / 12

  return {
    minute: (minutes * 360) % 360,
    hour: (hours * 360) % 360,
  }
}
