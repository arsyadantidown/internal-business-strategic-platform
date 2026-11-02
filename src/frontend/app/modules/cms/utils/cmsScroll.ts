export const scrollCmsSectionIntoView = (id: string, offset = 16) => {
  if (!import.meta.client) return
  const container = document.querySelector('main')
  const target = document.getElementById(id)
  if (!container || !target) return
  const distance = target.getBoundingClientRect().top - container.getBoundingClientRect().top
  container.scrollTo({ top: Math.max(0, container.scrollTop + distance - offset), behavior: 'smooth' })
}
