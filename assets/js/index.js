(() => {
  const storageKey = "sankeerth-theme";
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const savedTheme = () => {
    try {
      const value = window.localStorage.getItem(storageKey);
      return value === "dark" || value === "light" ? value : null;
    } catch (_) {
      return null;
    }
  };

  const systemTheme = () => (media.matches ? "dark" : "light");

  const updateToggle = (theme) => {
    const button = document.getElementById("theme-toggle");
    if (!button) return;

    const nextTheme = theme === "dark" ? "light" : "dark";
    button.textContent = theme === "dark" ? "☀" : "☾";
    button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    button.setAttribute("title", `Switch to ${nextTheme} mode`);
  };

  const applyTheme = (theme, persist = false) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;

    if (persist) {
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch (_) {
        // Theme still works when storage is blocked.
      }
    }

    updateToggle(theme);
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(savedTheme() || systemTheme());

    const button = document.getElementById("theme-toggle");
    if (button) {
      button.addEventListener("click", () => {
        const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
        applyTheme(nextTheme, true);
      });
    }
  });

  const followSystem = (event) => {
    if (!savedTheme()) {
      applyTheme(event.matches ? "dark" : "light");
    }
  };

  if (media.addEventListener) {
    media.addEventListener("change", followSystem);
  } else if (media.addListener) {
    media.addListener(followSystem);
  }
})();
