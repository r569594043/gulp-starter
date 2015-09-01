(function() {
    var doc, html, setFontSize, timeout, win;

    win = this;

    doc = win.document;

    html = doc.documentElement;

    timeout = null;

    setFontSize = function() {
        var htmlWidth, ratio;
        htmlWidth = html.getBoundingClientRect().width;
        ratio = htmlWidth / 640;
        win.rem = htmlWidth < 640 ? ratio * 1.5 : 1.5;
        win.responseRatio = ratio;
        return html.style.fontSize = win.rem + 'rem';
    };

    win.addEventListener('resize', function() {
        clearTimeout(timeout);
        return timeout = setTimeout(setFontSize, 300);
    }, false);

    setFontSize();

}).call(this);