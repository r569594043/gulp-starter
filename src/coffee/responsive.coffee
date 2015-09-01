win = this
doc = win.document
html = doc.documentElement
timeout = null
setFontSize = ->
    htmlWidth = html.getBoundingClientRect().width
    ratio = htmlWidth / 640
    win.rem = if htmlWidth < 640 then ratio * 1.5 else 1.5
    win.responseRatio = ratio
    html.style.fontSize = win.rem + 'rem'
win.addEventListener('resize', ->
        clearTimeout(timeout)
        timeout = setTimeout(setFontSize, 300)
    ,false)
setFontSize()