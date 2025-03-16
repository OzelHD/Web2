function switchTheme(theme) {
    document.body.classList.remove("light-mode", "contrast-mode", "dark-mode", "pastell-mode", "normal-mode");
    if (theme) {
        document.body.classList.add(theme);
    }
}

// Example Usage
document.getElementById("themeSelector").addEventListener("change", function () {
    switchTheme(this.value);
});
