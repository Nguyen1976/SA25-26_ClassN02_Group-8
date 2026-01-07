export const interceptorLoadingElements = (calling: unknown) => {
  // DOM lấy ra toàn bộ phần tử trên page hiện tại có className là 'interceptor-loading'
  const elements = document.querySelectorAll<HTMLElement>(
    '.interceptor-loading'
  )
  elements.forEach((el) => {
    if (calling) {
      el.style.opacity = '0.5'
      el.style.pointerEvents = 'none'
    } else {
      el.style.opacity = 'initial'
      el.style.pointerEvents = 'initial'
    }
  })
}
