window.addEventListener("load", () => {
    hightlightLanguage();
});

function hightlightLanguage() {
    if (!localStorage.getItem("language-check")) {
        localStorage.setItem("language-check", "english");
    }
    var languageList = document.querySelectorAll(".option .language");
    languageList.forEach((language) => {
        if (
            localStorage.getItem("language-check") ==
            language.getAttribute("id")
        ) {
            language.classList.add("active");
        }
        language.addEventListener("click", () => {
            localStorage.setItem("language-check", language.getAttribute("id"));

            var systemResponse = document.getElementById("system-response");
            localStorage.setItem("system-response", "");
            systemResponse.textContent =
                localStorage.getItem("system-response");
        });
        document.addEventListener("click", () => {
            if (
                localStorage.getItem("language-check") ==
                language.getAttribute("id")
            ) {
                language.classList.add("active");
            } else {
                language.classList.remove("active");
            }
        });
    });
}
