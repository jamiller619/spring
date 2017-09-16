
const bookmarksBarToggle = document.getElementById('bookmarksbar-enabled')
const bookmarksSearchToggle = document.getElementById('search-enabled')
const colorSchemeSelect = document.getElementById('color-scheme')

chrome.storage.sync.get('bookmarksBarEnabled', response => {
  bookmarksBarToggle.checked = response.bookmarksBarEnabled
})

chrome.storage.sync.get('searchEnabled', response => {
  bookmarksSearchToggle.checked = response.searchEnabled
})

chrome.storage.sync.get('colorScheme', response => {
  colorSchemeSelect.value = response.colorScheme
})

bookmarksBarToggle.addEventListener('change', () => {
  chrome.storage.sync.set({
    bookmarksBarEnabled: bookmarksBarToggle.checked
  })
})

bookmarksSearchToggle.addEventListener('change', () => {
  chrome.storage.sync.set({
    searchEnabled: bookmarksSearchToggle.checked
  })
})

colorSchemeSelect.addEventListener('change', () => {
  chrome.storage.sync.set({
    colorScheme: colorSchemeSelect.value
  })
})
