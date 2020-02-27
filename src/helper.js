import memoize from 'lodash/memoize'

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

const boundingRight = (displayedPages, viewWidth, xMargin, rightPage, maxX, zoom, zooming, pagesHires, pages) => {
  if (displayedPages === 1) { return viewWidth - xMargin }
  else {
      const x = pageUrl(rightPage, zoom, zooming, pagesHires, pages) ? viewWidth - xMargin : viewWidth / 2
      console.log('boundright', x, maxX)
      return x > maxX ? x : maxX
  }
}

const boundingLeft = (displayedPages, viewWidth, xMargin, leftPage, minX, zoom, zooming, pagesHires, pages) => {
  console.log('boundingLeft');
  if (displayedPages === 1) { return xMargin }
  else {
      const x = pageUrl(leftPage, zoom, zooming, pagesHires, pages) ? xMargin : viewWidth / 2
      return x < minX ? x : minX 
  }
}

const pageScale = (displayedPages, viewWidth, viewHeight, imageWidth, imageHeight) => {
  const vw = viewWidth / displayedPages;
  const xScale = vw / imageWidth;
  const yScale = viewHeight / imageHeight;
  const scale = xScale < yScale ? xScale : yScale;
  console.log('pageScale', displayedPages, viewWidth, viewHeight, imageWidth, imageHeight, scale);
  if (scale < 1) { return scale; } else { return 1; }
}

const pageWidth = (imageWidth, pageScale) => Math.round(imageWidth * pageScale)

const pageHeight = (imageHeight, pageScale) => Math.round(imageHeight * pageScale)

const xMargin = (viewWidth, pageWidth, displayedPages) => (viewWidth - pageWidth * displayedPages) / 2

const yMargin = (viewHeight, pageHeight) => (viewHeight - pageHeight) / 2

const centerOffsetSmoothed = (currentCenterOffset) => Math.round(currentCenterOffset)

export const _pageUrl = memoize(pageUrl)
export const _boundingRight = memoize(boundingRight)
export const _boundingLeft = memoize(boundingLeft)
export const _pageScale = memoize(pageScale)
export const _pageWidth = memoize(pageWidth)
export const _pageHeight = memoize(pageHeight)
export const _xMargin = memoize(xMargin)
export const _yMargin = memoize(yMargin)
export const _centerOffsetSmoothed = memoize(centerOffsetSmoothed)
