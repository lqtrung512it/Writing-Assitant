window.addEventListener("load", () => {
    var brand = document.querySelector(".header__brand");
    brand.addEventListener("click", () => {
        window.location.href = "/";
    });

    var auth = document.querySelector(".header__auth-user");
    var history = document.querySelector(".header__history");
    var logout = document.querySelector(".header__logout");
    if (localStorage.getItem("login") === "logged") {
        auth.style.display = "none";
        history.style.display = "block";
        logout.style.display = "block";
        history.addEventListener("click", () => {
            window.location.href = "/history";
        });
        logout.addEventListener("click", () => {
            localStorage.setItem("login", "none");
            localStorage.setItem("email", "none");
            window.location.href = "/";
        });
    } else {
        auth.style.display = "block";
        history.style.display = "none";
        logout.style.display = "none";
        auth.addEventListener("click", () => {
            window.location.href = "/login";
        });
    }

    highlightCurrentPage();
});

// Check current path name and current feature
// Redirect page
function highlightCurrentPage() {
    var currentPath = window.location.pathname;
    var currentPage = currentPath.split("/")[1];
    var featureList = document.querySelectorAll(".toolbar__item");
    featureList.forEach((feature) => {
        if (feature.id === currentPage) {
            feature.classList.add("highlight");
        } else {
            feature.classList.remove("highlight");
        }
        // Redirect page
        feature.addEventListener("click", () => {
            if (feature.id !== currentPage) {
                window.location.href = "/" + feature.id;
                localStorage.setItem("path-name", feature.id);
            }
        });
    });
}
