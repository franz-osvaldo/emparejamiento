/**
 * ARCHIVO: theme-switcher.js
 * DESCRIPCIÓN: Gestión de tema (Dark/Light) con persistencia y detección de SO.
 */

(function () {
  'use strict';

  // Constantes de configuración
  const STORAGE_KEY = 'theme';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';
  
  // Referencia al elemento root (html)
  const root = document.documentElement;

  /**
   * 1. DETECCIÓN
   * Determina el tema inicial basado en:
   * LocalStorage > Preferencia del Sistema Operativo > Default (Light)
   */
  const getPreferredTheme = () => {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    
    if (storedTheme) {
      return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? THEME_DARK
      : THEME_LIGHT;
  };

  /**
   * 2. APLICACIÓN
   * Aplica el atributo al HTML y guarda la preferencia.
   * @param {string} theme - 'dark' o 'light'
   */
  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  };

  // Ejecución inmediata al cargar el script para evitar parpadeos
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  /**
   * 3. FUNCIÓN TOGGLE (Global)
   * Expuesta a window para ser llamada desde el HTML.
   */
  window.toggleTheme = () => {
    const currentTheme = root.getAttribute('data-theme') || THEME_LIGHT;
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    
    applyTheme(newTheme);
  };
  
  // Listener opcional: Escuchar cambios en vivo de la configuración del SO
  // si el usuario no ha definido una preferencia manual.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
    }
  });

})();