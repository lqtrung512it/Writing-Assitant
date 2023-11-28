window.addEventListener("load", () => {
    const selectOption = document.querySelector(
        "section .history-view #select-option"
    );
    const email = localStorage.getItem("email");
    getView(email, 0);
    selectOption.addEventListener("change", (e) => {
        const selectedTable = e.target.value;
        console.log(selectedTable);
        getView(email, selectedTable);
    });
});

// Hàm render bảng
function renderTable(tableData) {
    const tableContainer = document.getElementById("table-container");
    tableContainer.innerHTML = "";
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Create table header row using template literals
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th style="width: 20%;">Time</th>
      <th style="width: 40%;">Your Sentences</th>
      <th style="width: 40%;">Our Response</th>
    `;
    thead.appendChild(headerRow);

    // Create rows for each data item
    tableData.forEach((rowData) => {
        const row = document.createElement("tr");
        const timeCell = document.createElement("td");
        const inputCell = document.createElement("td");
        const outputCell = document.createElement("td");

        console.log(rowData);
        console.log(rowData.date);
        console.log(rowData.type);
        console.log(convertToTitleCase(rowData.type));
        const timeType = `${rowData.date}\n${convertToTitleCase(rowData.type)}`;
        timeCell.innerHTML = timeType.replace(/\n/g, "<br>");

        const input = rowData.input;
        inputCell.textContent = input;

        const output = JSON.parse(rowData.output);
        if (rowData.type === "plagiarism-checker") {
            console.log(output.percentage);
            if (output.percentage !== "0") {
                outputCell.innerHTML = `<p class='percentage'>${output.percentage}%</p>`;
                console.log(output.sources);

                const ulElement = document.createElement("ol");

                output.sources[0].forEach((title, i) => {
                    const src = output.sources[1][i];

                    const liElement = document.createElement("li");
                    const aElement = document.createElement("a");
                    aElement.href = src;
                    aElement.textContent = title;

                    liElement.appendChild(aElement);
                    ulElement.appendChild(liElement);
                });

                outputCell.appendChild(ulElement);
            } else {
                outputCell.innerHTML = `<p class='percentage'>${output.percentage}%</p>`;
            }
        } else {
            outputCell.innerHTML = output.response
                .replace(/\n/g, "<br>")
                .replace(/<br>/g, (match, offset) => {
                    if ([0, 1, 2, 4].includes(offset)) {
                        return "";
                    }
                    return match;
                });
        }

        row.appendChild(timeCell);
        row.appendChild(inputCell);
        row.appendChild(outputCell);
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function getView(email, selectedTable) {
    fetch(`/api/history?email=${email}&type=${selectedTable}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            renderTable(data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function convertToTitleCase(text) {
    var words = text.split("-");
    var titleCaseWords = words.map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return titleCaseWords.join(" ");
}
