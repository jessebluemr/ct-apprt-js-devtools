import { createSpy } from "./spy";
if (window["$apprt"]) {
    console.warn("$apprt already defined, please reload the window.");
} else {
    (function () {
        if (!document.contentType || !document.contentType.startsWith("text/html")){
            return;
        }
        if (document.documentElement && !/html/i.test(document.documentElement.tagName)){
            return;
        }
        var s = document.createElement("script");
        s.textContent = '(' + createSpy + ')();';
        (document.head || document.documentElement).appendChild(s);
        s.remove();
    })();
}
