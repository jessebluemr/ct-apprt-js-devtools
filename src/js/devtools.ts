chrome.devtools.panels.create("app.rt", null, "/html/panel.html", function (panel) {
    let panelWin: any;
    panel.onHidden.addListener(function () {
        panelWin?.refreshPanel?.(false);
        panelWin = undefined;
    })
    panel.onShown.addListener(function (panelWindow) {
        panelWin = panelWindow;
        panelWin?.refreshPanel?.(true);
    })
    // if inspectedWindow changes
    chrome.devtools.network.onNavigated.addListener(function() {
        panelWin?.refreshPanel?.(true);
    });
});
