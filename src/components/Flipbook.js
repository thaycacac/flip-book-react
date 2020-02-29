import React, { useState, useEffect, useRef } from "react";
import {
  easeIn,
  easeInOut,
  easeOut,
  _boundingRight,
  _boundingLeft,
  _pageWidth,
  _pageHeight,
  _xMargin,
  _yMargin,
  _centerOffsetSmoothed
} from "../helper";
import "./Styles.css";

const Flipbook = ({ pages, pagesHires, flipDuration = 1000 }) => {
  const flipInit = {
    progress: 0,
    direction: null,
    frontImage: null,
    backImage: null,
    auto: false
  };

  const viewportRef = useRef(null);

  const [hasTouchEvents, setHasTouchEvents] = useState(false);
  const [hasPointerEvents, setHasPointerEvents] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [flip, setFlip] = useState(flipInit);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [displayedPages, setDisplayedPages] = useState(1);
  const [zooming, setZooming] = useState(false);
  const [leftPage, setLeftPage] = useState(0);
  const [rightPage, setRightPage] = useState(1);
  const [nImageLoad, setNImageLoad] = useState(0);
  const [nImageLoadTrigger, setNImageLoadTrigger] = useState(0);
  const [imageLoadCallback, setImageLoadCallback] = useState(null);
  const [imageWidth, setImageWidth] = useState(null);
  const [imageHeight, setImageHeight] = useState(null);
  const [viewWidth, setViewWidth] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const [nPages, setNPages] = useState(pages.length);
  const [containerWidth, setContainerWidth] = useState("100%");
  const [currentCenterOffset, setCurrentCenterOffset] = useState(null);
  const [minX, setMinX] = useState(Infinity);
  const [maxX, setMaxX] = useState(-Infinity);
  const [preloadedImages, setPreloadedImages] = useState({});
  const [pageScale, setPageScale] = useState(1);

  // computed
  const pageWidth = _pageWidth(imageWidth, pageScale);
  const pageHeight = _pageHeight(imageHeight, pageScale);
  const xMargin = _xMargin(viewWidth, pageWidth, displayedPages);
  const yMargin = _yMargin(viewHeight, pageHeight);
  const centerOffsetSmoothed = _centerOffsetSmoothed(currentCenterOffset);
  const boundingRight = _boundingRight(
    displayedPages,
    viewWidth,
    xMargin,
    rightPage,
    maxX,
    pages
  );
  const boundingLeft = _boundingLeft(
    displayedPages,
    viewWidth,
    xMargin,
    leftPage,
    minX,
    pages
  );

  useEffect(() => {
    window.addEventListener("resize", () => onResize(), { passive: true });
    onResize();
    preloadImages();
    // computed
    handlePageScale();
  }, [viewWidth, viewHeight]);

  const handlePageScale = () => {
    console.log("fdsfsdf", viewWidth, displayedPages);
    const vw = viewWidth / displayedPages;
    const xScale = vw / imageWidth;
    const yScale = viewHeight / imageHeight;
    const scale = xScale < yScale ? xScale : yScale;
    console.log("scale", scale);
    if (scale < 1) {
      setPageScale(scale);
    } else {
      setPageScale(1);
    }
  };

  useEffect(() => {
    console.log("computed", {
      pageScale: pageScale,
      pageWidth: pageWidth,
      pageHeight: pageHeight,
      xMargin: xMargin,
      yMargin: yMargin,
      centerOffsetSmoothed: centerOffsetSmoothed,
      boundingRight: boundingRight,
      boundingLeft: boundingLeft,
      displayedPages: displayedPages,
      viewHeight: viewHeight,
      viewWidth: viewWidth,
      currentPage: currentPage,
      leftPage: leftPage,
      maxX: maxX,
      minX: minX,
      imageWidth: imageWidth,
      imageHeight: imageHeight
    });
  }, [
    displayedPages,
    viewHeight,
    xMargin,
    rightPage,
    maxX,
    imageWidth,
    pageScale,
    viewWidth,
    pageWidth,
    pageHeight,
    currentCenterOffset,
    minX,
    leftPage
  ]);

  const onMouseDown = ev => {
    if (hasTouchEvents || hasPointerEvents) {
      return;
    }
    if (ev.which && ev.which !== 1) {
      return;
    } // Ignore right-click
    return swipeStart(ev);
  };

  const onMouseMove = ev => {
    if (hasTouchEvents || hasPointerEvents) {
      return;
    }
    if (ev.which && ev.which !== 1) {
      return;
    } // Ignore right-click
    return swipeStart(ev);
  };

  const onResize = () => {
    const width = viewportRef.current.clientWidth;
    const height = viewportRef.current.clientHeight;
    setViewWidth(width);
    setViewHeight(height);
    setDisplayedPages(viewWidth > viewHeight ? 2 : 1);
    if (displayedPages === 2) {
      setCurrentPage((currentPage = currentPage & ~1));
    }
    if (displayedPages === 1 && !pageUrl(leftPage)) {
      setCurrentPage(currentPage + 1);
    }
    setMinX(Infinity);
    setMaxX(-Infinity);
  };

  const preloadImages = () => {
    let asc, start, end, i, img, url;
    if (Object.keys(preloadedImages).length >= 10) {
      setPreloadedImages({});
    }
    for (
      start = currentPage - 3,
        i = start,
        end = currentPage + 3,
        asc = start <= end;
      asc ? i <= end : i >= end;
      asc ? i++ : i--
    ) {
      url = pageUrl(i);
      if (url) {
        if (!preloadedImages[url]) {
          img = new Image();
          img.src = url;
          preloadedImages[url] = img;
        }
      }
    }
  };

  const swipeStart = touch => {
    setTouchStartX(touch.pageX);
    setTouchStartY(touch.pageY);
  };

  const canFlipLeft = () => {
    console.log("canFlipLeft");
    return (
      !flip.direction &&
      currentPage >= displayedPages &&
      !(displayedPages === 1 && !pageUrl(leftPage - 1))
    );
  };

  const canFlipRight = () => {
    console.log("canFlipLeft");
    return !flip.direction && currentPage < nPages - displayedPages;
  };

  const pageUrl = (page, hiRes = false) => {
    if (hiRes && zoom > 1 && !zooming) {
      const url = pagesHires[page];
      if (url) return url;
    }
    return pages[page] || null;
  };

  const swipeMove = touch => {
    console.log("swipeMove");
    if (zoom > 1) {
      return;
    }
    if (touchStartX === null) {
      return;
    }
    const x = touch.pageX - touchStartX;
    const y = touch.pageY - touchStartY;
    if (Math.abs(y) > Math.abs(x)) {
      return;
    }
    if (x > 0) {
      if (flip.direction === null && canFlipLeft() && x >= 5) {
        flipStart("left", false);
      }
      if (flip.direction === "left") {
        setFlip({ ...flip, progress: x / pageWidth });
      }
      if (flip.progress > 1) {
        setFlip({ ...flip, progress: 1 });
      }
    } else {
      if (flip.direction === null && canFlipRight() && x <= -5) {
        flipStart("right", false);
      }
      if (flip.direction === "right") {
        setFlip({ ...flip, progress: -x / pageWidth });
      }
      if (flip.progress > 1) {
        setFlip({ ...flip, progress: 1 });
      }
    }
    return true;
  };

  const flipStart = (dir, auto) => {
    if (dir == "left") {
      if (displayedPages === 1) {
        setFlip({
          ...flip,
          frontImage: pageUrl(currentPage - 1),
          backImage: null
        });
      } else {
        setFlip({
          ...flip,
          frontImage: leftPage,
          backImage: currentPage - displayedPages + 1
        });
      }
    } else {
      if (displayedPages === 1) {
        setFlip({ ...flip, frontImage: pageUrl(currentPage), backImage: null });
      } else {
        setFlip({
          ...flip,
          frontImage: pageUrl(rightPage),
          backImage: currentPage + displayedPages
        });
      }
    }
    setFlip({ ...flip, direction: dir, progress: 0 });
    return requestAnimationFrame(() => {
      return requestAnimationFrame(() => {
        if (flip.direction === "left") {
          if (displayedPages === 2) {
            setLeftPage(currentPage - displayedPages);
          }
        } else {
          if (displayedPages === 1) {
            setLeftPage(currentPage + displayedPages);
          } else {
            setRightPage(currentPage + 1 + displayedPages);
          }
        }
        if (auto) flipAuto(true);
      });
    });
  };

  const flipAuto = ease => {
    const t0 = Date.now();
    const duration = flipDuration * (1 - flip.progress);
    const startRatio = flip.progress;
    setFlip({ ...flip, auto: true });
    var animate = () => {
      return requestAnimationFrame(() => {
        const t = Date.now() - t0;
        let ratio = startRatio + t / duration;
        if (ratio > 1) ratio = 1;
        flip.progress = ease ? easeInOut(ratio) : ratio;
        if (ratio < 1) {
          return animate();
        } else {
          if (flip.duration === "left") {
            setCurrentPage(currentPage - displayedPages);
          } else {
            setCurrentPage(currentPage + displayedPages);
          }
          if (displayedPages === 1 && flip.direction === "right") {
            setFlip({ ...flip, direction: null });
          } else {
            onImageLoad(1, () => flip.direction === null);
          }
          setFlip({ ...flip, auto: false });
        }
      });
    };
    return animate();
  };

  const didLoadImage = ev => {
    if (imageWidth === null) {
      setImageWidth((ev.target || ev.path[0]).naturalWidth);
      setImageHeight((ev.target || ev.path[0]).naturalHeight);
    }
    if (!imageLoadCallback) {
      return;
    }
    if (++nImageLoad >= nImageLoadTrigger) {
      setImageLoadCallback(null);
    }
  };

  const onImageLoad = (trigger, cb) => {
    setNImageLoad(0);
    setNImageLoadTrigger(trigger);
    setImageLoadCallback(cb);
  };

  const swipeEnd = touch => {};

  return (
    <div
      className="flipbook"
      onMouseDown={ev => onMouseDown(ev)}
      onMouseMove={ev => onMouseMove(ev)}
    >
      <div
        ref={viewportRef}
        className={zooming || zoom > 1 ? "viewport zoom" : "viewport"}
      >
        <div
          className="container"
          style={{
            transform: `scale(${zoom})`,
            width: containerWidth
          }}
        >
          <div
            className="centering-box"
            style={{
              transform: `translateX(${centerOffsetSmoothed}px)`
            }}
          >
            <div
              className="bounding-box"
              style={{
                left: boundingLeft + "px",
                top: yMargin + "px",
                width: boundingRight - boundingLeft + "px",
                height: pageHeight + "px"
              }}
            >
              {pageUrl(leftPage, true) && displayedPages === 2 && (
                <img
                  className="page fixed"
                  style={{
                    width: pageWidth + "px",
                    height: pageHeight + "px",
                    left: xMargin + "px",
                    top: yMargin + "px"
                  }}
                  src={pageUrl(leftPage, true)}
                  onLoad={$event => didLoadImage($event)}
                />
              )}
              {pageUrl(rightPage, true) && (
                <img
                  className="page fixed"
                  style={{
                    width: pageWidth + "px",
                    height: pageHeight + "px",
                    left: viewWidth / 2 + "px",
                    top: yMargin + "px"
                  }}
                  src={pageUrl(rightPage, true)}
                  onLoad={$event => didLoadImage($event)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flipbook;
