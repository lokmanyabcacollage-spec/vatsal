(function () {
  const storageKey = "marketweave-theme";
  const toggleButton = document.getElementById("themeToggle");

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    if (toggleButton) {
      toggleButton.textContent = isDark ? "Light mode" : "Dark mode";
    }
  }

  const savedTheme = localStorage.getItem(storageKey) || "light";
  applyTheme(savedTheme);

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);
    });
  }
})();
