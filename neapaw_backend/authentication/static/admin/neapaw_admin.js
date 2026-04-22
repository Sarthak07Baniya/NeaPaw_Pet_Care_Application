// Force a stable light admin theme for Jazzmin/Bootstrap.
(function () {
  function applyLightTheme() {
    document.documentElement.setAttribute("data-bs-theme", "light");
    document.body.setAttribute("data-bs-theme", "light");

    try {
      localStorage.setItem("theme", "light");
      localStorage.setItem("dark-mode", "false");
      localStorage.setItem("jazzmin_ui_theme", "light");
      localStorage.setItem("jazzmin_theme_mode", "light");
    } catch (error) {
      // Ignore storage issues; the DOM attributes still force light mode.
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLightTheme);
  } else {
    applyLightTheme();
  }
})();
