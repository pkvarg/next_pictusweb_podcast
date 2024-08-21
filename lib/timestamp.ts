export const getTimeStamp = () => {
  const now = Date.now()
  const date = new Date(now) // Create a Date object from the timestamp

  // Format the date and time
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  // Combine into a single string
  return `${year}_${month}-${day}_${hours}_${minutes}_${seconds}`
}
