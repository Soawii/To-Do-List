import "./index.css";
import ListController from "./ListController";
import DOMController from "./DOMController";
import { list } from "./todo";

function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
        e instanceof DOMException &&
        e.name === "QuotaExceededError" &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
        );
    }
}

const checkbox_theme = document.querySelector("#checkbox-theme");
if (storageAvailable("localStorage")) {
    const theme_key = "to-do-list-theme";
    if (localStorage.getItem(theme_key) !== null) {
        const saved_theme = localStorage.getItem(theme_key);
        if (saved_theme === "dark") {
            document.documentElement.setAttribute("theme", "dark");
            checkbox_theme.click();
        }
    }
    window.addEventListener("beforeunload", (e) => {
        localStorage.setItem(theme_key, checkbox_theme.checked ? "dark" : "light");
    });
}

const dom_controller = new DOMController();
const list_controller = new ListController();

if (storageAvailable("localStorage")) {
    const data_key = "to-do-list-data";

    if (localStorage.getItem(data_key) !== null) {
        list_controller.loadStorage(JSON.parse(localStorage.getItem(data_key)));
    }
    else {
        list_controller.loadDefault();
    }
    window.addEventListener("beforeunload", (e) => {
        localStorage.setItem(data_key, JSON.stringify(list.convertToSaveable()));
    });
}
else {
    list_controller.loadDefault();
}