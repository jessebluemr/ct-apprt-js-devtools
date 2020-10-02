import { createSpy } from "./spy";
if (window["$apprt"]) {
    console.warn("$apprt already defined, please reload the window.");
} else {
    (function () {
        var s = document.createElement("script");
        s.textContent = '(' + createSpy + ')();';
        (document.head || document.documentElement).appendChild(s);
        //s.remove();
    })();
}
