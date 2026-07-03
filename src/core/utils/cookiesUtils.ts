// Funcion para obtener una cookie
export const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

// Funcion para guardar una cookie
export const setCookie = (name: string, value: string, days: number): void => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
};

// Funcion para obtener el consentimiento elegido por el usuario
export function getCookieConsent() {
  const data = localStorage.getItem("site_cookie_consent_v1");
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function hasConsentFor(type: "essential" | "analytics" | "marketing") {
  const consent = getCookieConsent();
  return consent?.prefs?.[type] === true;
}
