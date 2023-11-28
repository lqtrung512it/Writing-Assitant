window.addEventListener("load", () => {
    localStorage.setItem("fill-in", false);

    document.getElementById("auth").addEventListener("click", (e) => {
        e.preventDefault();
        var errorCheck = true;
        var errorContent = document.querySelectorAll(".error-message");
        errorContent.forEach((content) => {
            if (
                content.textContent === "" &&
                localStorage.getItem("fill-in") === "true"
            ) {
                errorCheck = false;
            } else {
                errorCheck = true;
            }
        });
        if (!errorCheck) {
            sendAuthData();
        }
    });
    var currentPath = window.location.pathname;
    var currentPage = currentPath.split("/")[1];
    localStorage.setItem("path-name", currentPage);

    var userInputList = document.querySelectorAll(".input-box input");
    userInputList.forEach((userInput) => {
        var error = getInputError(userInput);
        validate(userInput, error);
    });

    const googleBtn = document.querySelector(
        ".form-value form div.google-login"
    );
    console.log(googleBtn);
    googleBtn.addEventListener("click", () => {
        loginByGoogle();
    });
});

function validate(userInput, error) {
    userInput.addEventListener("keyup", () => {
        checkError(userInput, error);
    });
}

function getInputError(userInput) {
    var error = userInput.parentNode.nextElementSibling;
    return error;
}

function checkError(userInput, error) {
    localStorage.setItem("fill-in", false);
    if (isEmptyError(userInput)[0]) {
        error.textContent = isEmptyError(userInput)[1];
    } else if (
        userInput.getAttribute("id") === "email" &&
        isEmailError(userInput)[0]
    ) {
        error.textContent = isEmailError(userInput)[1];
    } else if (
        userInput.getAttribute("id") === "password" &&
        isPasswordError(userInput)[0]
    ) {
        error.textContent = isPasswordError(userInput)[1];
    } else if (
        userInput.getAttribute("id") === "repassword" &&
        isConfirmPasswordError(userInput)[0]
    ) {
        error.textContent = isConfirmPasswordError(userInput)[1];
    } else {
        error.textContent = "";
        localStorage.setItem("fill-in", true);
    }
}

function isEmptyError(userInput) {
    var isEmptyError = false;
    var message = "You have to fill in this field";
    isEmptyError = userInput.value === "" ? true : false;
    return [isEmptyError, message];
}

function isEmailError(userInput) {
    var isEmailError = false;
    var emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    var message = "Your email must be: example@gmail.com";
    isEmailError = !emailRegex.test(userInput.value) ? true : false;
    return [isEmailError, message];
}

function isPasswordError(userInput) {
    var isPassWordError = false;
    var passwordRegex1 = /^.{8,}$/;
    var passwordRegex2 = /^(?=.*[A-Z])/;
    var passwordRegex3 = /^(?=.*[a-z])/;
    var passwordRegex4 = /^(?=.*\d).*$/;
    var message1 = "Your password must has at least 8 characters";
    var message2 = "Your password must has 1 capitalize letter";
    var message3 = "Your password must has 1 lowercase letter";
    var message4 = "Your password must has 1 digit";

    if (!passwordRegex1.test(userInput.value)) {
        isPassWordError = true;
        return [isPassWordError, message1];
    } else {
        isPassWordError = true;
        if (!passwordRegex2.test(userInput.value)) {
            return [isPassWordError, message2];
        } else if (!passwordRegex3.test(userInput.value)) {
            return [isPassWordError, message3];
        } else if (!passwordRegex4.test(userInput.value)) {
            return [isPassWordError, message4];
        } else {
            isPassWordError = false;
            return [isPassWordError];
        }
    }
}

function isConfirmPasswordError(userInput) {
    var isConfirmPasswordError = false;
    const password = document.getElementById("password").value;
    var message = "Password does not match";
    isConfirmPasswordError = !(password === userInput.value) ? true : false;
    if (isConfirmPasswordError) {
        localStorage.setItem("match", true);
    }
    return [isConfirmPasswordError, message];
}

function sendAuthData() {
    const currentPathname = localStorage.getItem("path-name");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            currentPathname: currentPathname,
            email: email,
            password: password,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data.status);
            console.log(data.message);
            alert(data.message);
            if (data.status === "success") {
                localStorage.setItem("email", email);
                localStorage.setItem("login", "logged");
                setTimeout(() => {
                    window.location.href = "/grammar-checker";
                    localStorage.setItem("path-name", "grammar-checker");
                }, 2000);
            }
        })
        .catch((err) => console.log(err));
}

function loginByGoogle() {
    // fetch(`/login/google`, {
    //     method: "GET",
    //     mode: "no-cors",
    // })
    //     .then((response) => console.log(response))
    //     .then((data) => {
    //         console.log(data);
    //         // Xử lý response từ Flask ở đây
    //     })
    //     .catch((error) => {
    //         console.error("Error:", error);
    //     });
    window.open("/login/google", "_blank");
}
