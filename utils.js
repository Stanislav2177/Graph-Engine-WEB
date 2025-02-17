// utils.js
export function changeStatus(text) {
    if (text == "base") {
        document.getElementById("statusLabel").innerHTML = "Status: Waiting for action...";
    } else {
        document.getElementById("statusLabel").innerHTML = text;
    }
}

export function setTimeOutFn(status, ms) {
    if (typeof status === "string" && Number.isInteger(ms)) {
        setTimeout(() => {
            changeStatus(status);
        }, ms);
    } else {
        setTimeout(() => {
            changeStatus("base");
        }, 3000);
    }
}

export function addTextToStatus(text) {
    const t = document.getElementById("statusLabel").innerHTML;
    document.getElementById("statusLabel").innerHTML = t + "<br>" + text;
}