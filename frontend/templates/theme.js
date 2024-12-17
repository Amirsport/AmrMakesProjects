(function () {
    if (window.matchMedia) {
        var changecolormode = function (e) {
            document.documentElement.setAttribute("data-bs-theme", e.matches ? "dark" : "light");
        }
        var media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener("change", changecolormode);
        changecolormode(media)
    }
})()
