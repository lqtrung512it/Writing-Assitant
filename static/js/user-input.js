window.addEventListener("load", () => {
    var submitButton = document.querySelector(".input-field form input");
    var firstUserInput = document.getElementById("first-user-input");
    var firstWordCount = document.querySelector(".first-word-count");
    repeatedFunction(firstUserInput, firstWordCount);

    if (localStorage.getItem("path-name") === "lagiarism-checker") {
        var secondUserInput = document.getElementById("second-user-input");
        var secondWordCount = document.querySelector(".second-word-count");
        repeatedFunction(secondUserInput, secondWordCount);
    }

    changeSubmit(submitButton);
});

function repeatedFunction(userInput, limitCount) {
    getUserInput(userInput);
    countWord(userInput, limitCount);
    saveUserInput(userInput, limitCount);
}

function saveUserInput(userInput, limitCount) {
    userInput.addEventListener("keyup", () => {
        countWord(userInput, limitCount);
        localStorage.setItem(userInput.getAttribute("id"), userInput.innerHTML);
    });
}

function countWord(userInput, limitCount) {
    var inputValue = userInput.innerHTML.replace(/\s+/g, " ");
    var count = inputValue.trim().split(" ").length;
    limitCount.classList.remove("limit");
    if (count == 0 || inputValue == "") {
        limitCount.innerHTML = "";
    } else if (count == 1) {
        limitCount.innerHTML = "1 word";
    } else if (count < 150) {
        limitCount.innerHTML = count + " words";
    } else {
        limitCount.innerHTML = count + "/150 words";
        limitCount.classList.add("limit");
    }
}

function getUserInput(userInput) {
    userInput.textContent = localStorage.getItem(userInput.getAttribute("id"));
}

function changeSubmit(button) {
    if (
        localStorage.getItem("first-user-input") === "" ||
        (localStorage.getItem("path-name") === "lagiarism-checker" &&
            localStorage.getItem("second-user-input") === "" &&
            localStorage.getItem("first-user-input") === "")
    ) {
        button.classList.remove("fixable");
    } else {
        button.classList.add("fixable");
    }
    var firstUserInput = document.getElementById("first-user-input");
    checkFixable(firstUserInput, button);
    firstUserInput.addEventListener("keyup", () => {
        checkFixable(firstUserInput, button);
    });
    if (localStorage.getItem("path-name") === "lagiarism-checker") {
        var secondUserInput = document.getElementById("second-user-input");
        checkFixable(secondUserInput, button);
        secondUserInput.addEventListener("keyup", () => {
            checkFixable(secondUserInput, button);
        });
    }
    button.addEventListener("click", (e) => {
        e.preventDefault();
        if (button.classList.contains("fixable")) {
            sendData();
        }
    });
}

function checkFixable(userInput, button) {
    var count = userInput.innerHTML
        .replace(/\s+/g, " ")
        .trim()
        .split(" ").length;
    if (userInput.innerHTML === "" || count == 0 || count >= 150) {
        button.classList.remove("fixable");
    } else {
        button.classList.add("fixable");
    }
}

function sendData() {
    const currentPathname = localStorage.getItem("path-name");
    const savedFirstInput = localStorage.getItem("first-user-input");
    const currentLanguage = localStorage.getItem("language-check");
    const login = localStorage.getItem("login");
    const email = localStorage.getItem("email");
    const dateObj = new Date();
    const date = `${dateObj.getHours()}:${dateObj.getUTCMinutes()}:${dateObj.getUTCSeconds()} ${dateObj.getUTCDate()}/${
        dateObj.getUTCMonth() + 1
    }/${dateObj.getUTCFullYear()}`;

    fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstUserInput: savedFirstInput,
            currentPathname: currentPathname,
            currentLanguage: currentLanguage,
            login: login,
            email: email,
            date: date,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            var systemResponse = document.getElementById("system-response");
            console.log(data.systemResponse);

            if (localStorage.getItem("path-name") !== "plagiarism-checker") {
                let result = "";
                const input = localStorage.getItem("first-user-input");
                data.systemResponse.forEach((e) => {
                    tmp = e.text.replaceAll("^[^0-9a-zA-Z]*", "").trim();
                    console.log(tmp);
                    const [highlightedText1, highlightedText2] =
                        highlightDifferences(input, tmp);
                    result += highlightedText2 + "<br><br>";
                });

                localStorage.setItem("system-response", result);

                systemResponse.innerHTML = result;
            } else {
                if (
                    data.systemResponse.percentPlagiarism !== 0 ||
                    data.systemResponse.percentPlagiarism !== undefined
                ) {
                    document.querySelector(
                        "#system-response .percentage .score"
                    ).innerHTML = data.systemResponse.percentPlagiarism + "%";
                    localStorage.setItem(
                        "plagiarism-system-response",
                        JSON.stringify(data.systemResponse)
                    );

                    document.querySelector(
                        "#system-response .sources .heading"
                    ).innerHTML = "Source that we found:";

                    let olElement = document.querySelector(
                        "#system-response .sources .list"
                    );

                    console.log(data.systemResponse.sources);
                    data.systemResponse.sources.forEach(function (src) {
                        var liElement = document.createElement("li");
                        liElement.innerHTML = `
                        <a href="${src.url}">${src.title}</a>
                    `;
                        olElement.appendChild(liElement);
                    });
                } else {
                    document.querySelector(
                        "#system-response .percentage .score"
                    ).innerHTML = "0%";
                }
            }
        })
        .catch((error) => console.error(error));
}

function highlightDifferences(text1, text2) {
    //split the strings
    var div1TextSplitted = text1.split(" ");
    var div2TextSplitted = text2.split(" ");

    //variables to cycle through the split string
    var wordNumber1 = 0;
    var wordNumber2 = 0;

    //new string to re-assign to the divs
    var newDiv1Text = "";
    var newDiv2Text = "";

    //Part 1: Red highlight
    while (true) {
        //if we reach the end of either string, break
        if (
            div1TextSplitted[wordNumber1] === undefined &&
            div2TextSplitted[wordNumber2] !== undefined
        ) {
            for (let i = wordNumber2; i < div2TextSplitted.length; i++) {
                newDiv2Text +=
                    "<span class='highlightYellow'>" +
                    div2TextSplitted[wordNumber2] +
                    "</span> ";
                wordNumber2++;
            }
        }

        if (
            div1TextSplitted[wordNumber1] !== undefined &&
            div2TextSplitted[wordNumber2] === undefined
        ) {
            for (let i = wordNumber1; i < div1TextSplitted.length; i++) {
                newDiv1Text +=
                    "<span class='highlightYellow'>" +
                    div1TextSplitted[wordNumber1] +
                    "</span> ";
                wordNumber1++;
            }
        }

        if (
            div1TextSplitted[wordNumber1] === undefined &&
            div2TextSplitted[wordNumber2] === undefined
        ) {
            break;
        }

        //if we find a word that ISNT the same
        if (div1TextSplitted[wordNumber1] !== div2TextSplitted[wordNumber2]) {
            //add in a span
            newDiv1Text +=
                "<span class='highlightRed'>" +
                div1TextSplitted[wordNumber1] +
                "</span> ";
            newDiv2Text +=
                "<span class='highlightYellow'>" +
                div2TextSplitted[wordNumber2] +
                "</span> ";
            //increment the variables
            wordNumber2++;
            wordNumber1++;
        }
        //otherwise we have the same text
        else {
            //append the same text with no changes
            newDiv1Text += div1TextSplitted[wordNumber1] + " ";
            newDiv2Text += div2TextSplitted[wordNumber2] + " ";
            //increment variables
            wordNumber1++;
            wordNumber2++;
        }
    }
    return [newDiv1Text, newDiv2Text];
}
