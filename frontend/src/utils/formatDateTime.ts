export const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return ''

  const date = new Date(dateStr)

  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
