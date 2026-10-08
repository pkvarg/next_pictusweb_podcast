export const CONSENT_KEY = 'CookieConsent'
export const OPEN_COOKIE_SETTINGS_EVENT = 'pictus:open-cookie-settings'

export const hasAnalyticsConsent = () => {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'true'
  } catch {
    return false
  }
}

// Umami honours `umami.disabled`, so a withdrawn consent stops tracking
// even when the script is already loaded in the current tab.
export const storeConsent = (granted: boolean) => {
  try {
    localStorage.setItem(CONSENT_KEY, granted ? 'true' : 'false')
    if (granted) {
      localStorage.removeItem('umami.disabled')
    } else {
      localStorage.setItem('umami.disabled', '1')
    }
  } catch {
    // storage unavailable (private mode) — banner simply shows again next visit
  }
}

export const openCookieSettings = () => {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
}
