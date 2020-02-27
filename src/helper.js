export const easeIn = x => Math.pow(x, 2);

export const easeOut = x => 1 - easeIn(1 - x);

export const easeInOut = function(x) {
  if (x < 0.5) { return easeIn(x * 2) / 2; } else { return 0.5 + (easeOut((x - 0.5) * 2) / 2); }
};

const pageUrl = (page, zoom, zooming, pagesHires, pages, hiRes = false) => {
  if (hiRes && zoom > 1 && !zooming) {
      const url = pagesHires[page]
      if (url) return url
  }
  return pages[page] || null
}

export const _boundingRight = (displayedPages, viewWidth, xMargin, rightPage, maxX, zoom, zooming, pagesHires, pages) => {
  if (displayedPages === 1) { return viewWidth - xMargin }
  else {
      const x = pageUrl(rightPage, zoom, zooming, pagesHires, pages) ? viewWidth - xMargin : viewWidth / 2
      console.log('boundright', x, maxX)
      return x > maxX ? x : maxX
  }
}

export const _boundingLeft = (displayedPages, viewWidth, xMargin, leftPage, minX, zoom, zooming, pagesHires, pages) => {
  console.log('boundingLeft');
  if (displayedPages === 1) { return xMargin }
  else {
      const x = pageUrl(leftPage, zoom, zooming, pagesHires, pages) ? xMargin : viewWidth / 2
      return x < minX ? x : minX 
  }
}

export const _pageScale = (displayedPages, viewWidth, viewHeight, imageWidth, imageHeight) => {
  const vw = viewWidth / displayedPages;
  const xScale = vw / imageWidth;
  const yScale = viewHeight / imageHeight;
  const scale = xScale < yScale ? xScale : yScale;
  console.log('pageScale', displayedPages, viewWidth, viewHeight, imageWidth, imageHeight, scale);
  if (scale < 1) { return scale; } else { return 1; }
}