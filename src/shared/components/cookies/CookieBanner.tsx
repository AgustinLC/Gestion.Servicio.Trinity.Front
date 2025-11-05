import React, { useEffect, useState } from "react";
import "./CookieBanner.css";

const STORAGE_KEY = "site_cookie_consent_v1";

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

const saveConsent = (action: string, customPrefs?: typeof prefs) => {
  const payload = {
    action,
    prefs: customPrefs || prefs,
    date: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  setVisible(false);
};


  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>
          Usamos cookies para mejorar tu experiencia. Podés aceptar todas, rechazarlas o elegir tus preferencias.
        </p>
        <div className="cookie-buttons">
          <button
  onClick={() => {
    const newPrefs = { essential: true, analytics: true, marketing: true };
    setPrefs(newPrefs);
    saveConsent("accept_all", newPrefs);
  }}
>
  Aceptar todo
</button>

<button
  onClick={() => {
    const newPrefs = { essential: true, analytics: false, marketing: false };
    setPrefs(newPrefs);
    saveConsent("reject_all", newPrefs);
  }}
>
  Rechazar
</button>
          <button onClick={() => setShowPrefs(!showPrefs)}>
            Preferencias
          </button>
        </div>

        {showPrefs && (
          <div className="cookie-prefs">
            <label>
              <input type="checkbox" checked disabled /> Esenciales (obligatorias)
            </label>
            <label>
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={() => setPrefs({ ...prefs, analytics: !prefs.analytics })}
              />
              Analíticas
            </label>
            <label>
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={() => setPrefs({ ...prefs, marketing: !prefs.marketing })}
              />
              Marketing
            </label>
            <div>
              <button onClick={() => saveConsent("custom")}>Guardar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;
