// WordPress lazy-load plugins depend on site JavaScript that the article WebView
// does not include. Hydrate their real URLs before rendering native app articles.
export const articleImagesScript = `
(function () {
  function realUrl(element, names) {
    for (var i = 0; i < names.length; i += 1) {
      var value = element.getAttribute(names[i]);
      if (value && !/^\\s*(data:|javascript:|blob:)/i.test(value)) return value;
    }
    return null;
  }
  document.querySelectorAll('.content picture source').forEach(function (source) {
    var srcset = realUrl(source, ['data-srcset', 'data-lazy-srcset']);
    if (srcset) source.setAttribute('srcset', srcset);
  });
  document.querySelectorAll('.content img').forEach(function (image) {
    var src = realUrl(image, ['data-src', 'data-lazy-src', 'data-original']);
    var srcset = realUrl(image, ['data-srcset', 'data-lazy-srcset']);
    if (!src && !srcset) return;
    image.setAttribute('loading', 'eager');
    if (srcset) image.setAttribute('srcset', srcset);
    if (src) image.setAttribute('src', src);
  });
})();
`;
