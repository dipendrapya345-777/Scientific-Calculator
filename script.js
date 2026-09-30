const expressionDisplay =
    document.getElementById("expression");

const resultDisplay =
    document.getElementById("result");

const historyList =
    document.getElementById("historyList");

const angleModeButton =
    document.getElementById("angleMode");

const themeToggle =
    document.getElementById("themeToggle");

const clearHistoryButton =
    document.getElementById("clearHistory");


let currentExpression = "";
let lastAnswer = 0;

let memory = 0;

let angleMode = "DEG";

let secondFunction = false;


/* =========================
   DISPLAY
========================= */

function updateDisplay() {

    expressionDisplay.textContent =
        currentExpression || "Ready";

}


/* =========================
   NUMBER FORMATTING
========================= */

function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "Error";
    }

    return Number(
        number.toPrecision(12)
    ).toString();
}


/* =========================
   ANGLE CONVERSION
========================= */

function toRadians(value) {

    if (angleMode === "DEG") {
        return value * Math.PI / 180;
    }

    if (angleMode === "GRAD") {
        return value * Math.PI / 200;
    }

    return value;
}


/* =========================
   FACTORIAL
========================= */

function factorial(number) {

    if (
        number < 0 ||
        !Number.isInteger(number)
    ) {
        throw new Error();
    }

    let answer = 1;

    for (
        let i = 2;
        i <= number;
        i++
    ) {
        answer *= i;
    }

    return answer;
}


/* =========================
   SAFE CALCULATION
========================= */

function calculateExpression(input) {

    let expression = input
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replaceAll("−", "-")
        .replaceAll("π", "Math.PI")
        .replace(/\be\b/g, "Math.E")
        .replaceAll("^", "**");

    /*
        Basic validation.
        This calculator only accepts
        mathematical characters.
    */

    if (
        !/^[0-9+\-*/().%\s*MathPIE]+$/.test(
            expression
        )
    ) {
        throw new Error();
    }

    return Function(
        `"use strict"; return (${expression})`
    )();
}


/* =========================
   CALCULATE
========================= */

function calculate() {

    if (!currentExpression) {
        return;
    }

    try {

        const answer =
            calculateExpression(
                currentExpression
            );

        if (!Number.isFinite(answer)) {
            throw new Error();
        }

        const formatted =
            formatNumber(answer);

        addHistory(
            currentExpression,
            formatted
        );

        expressionDisplay.textContent =
            currentExpression + " =";

        resultDisplay.textContent =
            formatted;

        lastAnswer = answer;

        currentExpression =
            formatted;

    } catch {

        resultDisplay.textContent =
            "Error";

        setTimeout(() => {
            resultDisplay.textContent = "0";
        }, 1000);

    }
}


/* =========================
   ADD VALUE
========================= */

function addValue(value) {

    currentExpression += value;

    resultDisplay.textContent =
        currentExpression;

    updateDisplay();
}


/* =========================
   CLEAR
========================= */

function clearCalculator() {

    currentExpression = "";

    resultDisplay.textContent = "0";

    expressionDisplay.textContent =
        "Ready";
}


/* =========================
   DELETE
========================= */

function deleteLast() {

    currentExpression =
        currentExpression.slice(0, -1);

    resultDisplay.textContent =
        currentExpression || "0";

    updateDisplay();
}


/* =========================
   SCIENTIFIC FUNCTIONS
========================= */

function scientificFunction(type) {

    try {

        const value =
            Number(currentExpression);

        if (!Number.isFinite(value)) {
            throw new Error();
        }

        let answer;

        switch (type) {

            case "sin":

                answer = secondFunction
                    ? Math.asin(toRadians(value))
                    : Math.sin(toRadians(value));

                break;


            case "cos":

                answer = secondFunction
                    ? Math.acos(toRadians(value))
                    : Math.cos(toRadians(value));

                break;


            case "tan":

                answer = secondFunction
                    ? Math.atan(toRadians(value))
                    : Math.tan(toRadians(value));

                break;


            case "log":

                if (value <= 0)
                    throw new Error();

                answer =
                    secondFunction
                        ? Math.log2(value)
                        : Math.log10(value);

                break;


            case "ln":

                if (value <= 0)
                    throw new Error();

                answer =
                    Math.log(value);

                break;


            case "sqrt":

                if (value < 0)
                    throw new Error();

                answer =
                    Math.sqrt(value);

                break;


            case "cbrt":

                answer =
                    Math.cbrt(value);

                break;


            case "square":

                answer =
                    value ** 2;

                break;


            case "reciprocal":

                if (value === 0)
                    throw new Error();

                answer =
                    1 / value;

                break;


            case "factorial":

                answer =
                    factorial(value);

                break;


            case "absolute":

                answer =
                    Math.abs(value);

                break;

            default:
                return;
        }


        const formatted =
            formatNumber(answer);

        expressionDisplay.textContent =
            `${type}(${value})`;

        resultDisplay.textContent =
            formatted;

        currentExpression =
            formatted;

        lastAnswer =
            answer;

        addHistory(
            `${type}(${value})`,
            formatted
        );

        secondFunction = false;

    } catch {

        resultDisplay.textContent =
            "Error";

        currentExpression = "";

    }
}


/* =========================
   MEMORY
========================= */

function memoryClear() {

    memory = 0;
}

function memoryRecall() {

    addValue(
        formatNumber(memory)
    );
}

function memoryAdd() {

    try {

        memory +=
            Number(
                calculateExpression(
                    currentExpression
                )
            );

    } catch {}
}

function memorySubtract() {

    try {

        memory -=
            Number(
                calculateExpression(
                    currentExpression
                )
            );

    } catch {}
}


/* =========================
   HISTORY
========================= */

function addHistory(
    calculation,
    answer
) {

    const empty =
        historyList.querySelector(
            ".empty-history"
        );

    if (empty) {
        empty.remove();
    }


    const item =
        document.createElement("div");

    item.className =
        "history-item";


    item.innerHTML = `
        <div class="history-expression">
            ${calculation}
        </div>

        <div class="history-result">
            = ${answer}
        </div>
    `;


    item.addEventListener(
        "click",
        () => {

            currentExpression =
                answer;

            resultDisplay.textContent =
                answer;

            updateDisplay();

        }
    );


    historyList.prepend(item);


    /*
        Keep history small.
    */

    while (
        historyList.children.length > 20
    ) {

        historyList.lastElementChild.remove();

    }

}


/* =========================
   BUTTON HANDLING
========================= */

document
    .querySelectorAll("button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const value =
                    button.dataset.value;

                const action =
                    button.dataset.action;


                /* Number / operator */

                if (value !== undefined) {

                    addValue(value);

                    return;
                }


                /* Actions */

                switch (action) {

                    case "clear":

                        clearCalculator();

                        break;


                    case "backspace":

                        deleteLast();

                        break;


                    case "calculate":

                        calculate();

                        break;


                    case "sin":

                        scientificFunction("sin");

                        break;


                    case "cos":

                        scientificFunction("cos");

                        break;


                    case "tan":

                        scientificFunction("tan");

                        break;


                    case "log":

                        scientificFunction("log");

                        break;


                    case "ln":

                        scientificFunction("ln");

                        break;


                    case "sqrt":

                        scientificFunction("sqrt");

                        break;


                    case "cbrt":

                        scientificFunction("cbrt");

                        break;


                    case "square":

                        scientificFunction("square");

                        break;


                    case "factorial":

                        scientificFunction("factorial");

                        break;


                    case "reciprocal":

                        scientificFunction("reciprocal");

                        break;


                    case "absolute":

                        scientificFunction("absolute");

                        break;


                    case "percent":

                        currentExpression += "%";

                        updateDisplay();

                        break;


                    case "power":

                        addValue("^");

                        break;


                    case "ans":

                        addValue(
                            formatNumber(lastAnswer)
                        );

                        break;


                    case "second":

                        secondFunction =
                            !secondFunction;

                        button.classList.toggle(
                            "active"
                        );

                        break;


                    case "memory-clear":

                        memoryClear();

                        break;


                    case "memory-recall":

                        memoryRecall();

                        break;


                    case "memory-add":

                        memoryAdd();

                        break;


                    case "memory-subtract":

                        memorySubtract();

                        break;

                }

            }
        );

    });


/* =========================
   ANGLE MODE
========================= */

angleModeButton.addEventListener(
    "click",
    () => {

        if (angleMode === "DEG") {

            angleMode = "RAD";

        } else if (angleMode === "RAD") {

            angleMode = "GRAD";

        } else {

            angleMode = "DEG";

        }

        angleModeButton.textContent =
            angleMode;

    }
);


/* =========================
   HISTORY CLEAR
========================= */

clearHistoryButton.addEventListener(
    "click",
    () => {

        historyList.innerHTML = `
            <p class="empty-history">
                Your calculations will appear here.
            </p>
        `;

    }
);


/* =========================
   KEYBOARD SUPPORT
========================= */

document.addEventListener(
    "keydown",
    event => {

        const key = event.key;


        if (
            /^[0-9.]$/.test(key)
        ) {

            addValue(key);

            return;
        }


        if (
            ["+", "-", "*", "/", "(", ")", "^", "%"]
            .includes(key)
        ) {

            const converted = {

                "*": "×",

                "/": "÷",

                "-": "−"

            }[key] || key;


            addValue(converted);

            return;
        }


        if (
            key === "Enter" ||
            key === "="
        ) {

            calculate();

            return;
        }


        if (
            key === "Backspace"
        ) {

            deleteLast();

            return;
        }


        if (
            key === "Escape"
        ) {

            clearCalculator();

        }

    }
);


/* =========================
   THEME
========================= */

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );

        themeToggle.textContent =
            document.body.classList.contains(
                "light"
            )
                ? "☾"
                : "☀";

    }
);


/* =========================
   START
========================= */

clearCalculator();