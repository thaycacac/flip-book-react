import React, { useState, useEffect } from "react";
import {
  easeIn,
  easeInOut,
  easeOut,
} from "../helper";
import {
  _canFlipLeft,
  _canFlipRight,
  _polygonArray
} from '../computed'
import "./Styles.css";

const Flipbook = ({
  pages,
  flipDuration = 1000,
  perspective = '2400px',
  nPolygons = 10,
  spaceTop = 0
}) => {
  const flipInit = {
    progress: 0,
    direction: null,
    frontImage: null,
    backImage: null,
    auto: false
  };

  const [nPages, setNPages] = useState(pages.length);
  const [displayedPages, setDisplayedPages] = useState(1);
  const [nImageLoad, setNImageLoad] = useState(0);
  const [nImageLoadTrigger, setNImageLoadTrigger] = useState(0);
  const [imageLoadCallback, setImageLoadCallback] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [leftPage, setLeftPage] = useState(0);
  const [rightPage, setRightPage] = useState(1);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [hasPointerEvents, setHasPointerEvents] = useState(false);
  const [minX, setMinX] = useState(Infinity);
  const [maxX, setMaxX] = useState(-Infinity);
  const [preloadedImages, setPreloadedImages] = useState({});
  const [flip, setFlip] = useState(flipInit);
  const [pageWidth, setPageWidth] = useState(640)
  const [pageHeight, setPageHeight] = useState(906)
  const [xMargin, setXMargin] = useState(0) // this.pageWidth * 2 - this.pageWidth * this.displayedPages) / 2
  // computed
  const canFlipLeft = _canFlipLeft(pages, flip, currentPage, displayedPages, leftPage)
  const canFlipRight = _canFlipRight(flip, currentPage, nPages, displayedPages)
  const polygonArray = _polygonArray(flip, displayedPages, pageWidth, nPolygons, xMargin, spaceTop, perspective, minX, maxX, setMinX, setMaxX)

  useEffect(() => {
    onResize();
    preloadImages();
  }, []);

  // method
  const onResize = () => {
    setDisplayedPages(pageWidth * 2 > pageHeight ? 2 : 1)
    if (displayedPages === 2) {
      setCurrentPage(currentPage &= ~1)
    }
    if (displayedPages === 1 && !pageUrl(leftPage)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const pageUrl = (page) => {
    return pages[page] || null;
  }

  const flipLeft = () => {
    if (!canFlipLeft) {
      return;
    }
    return flipStart('left', true);
  }

  const flipRight = () => {
    if (!canFlipRight) {
      return;
    }
    return flipStart('right', true);
  }

  const flipStart = (direction, auto) => {
    if (direction === 'left') {
      if (displayedPages === 1) {
        setFlip({
          ...flip,
          frontImage: pageUrl(currentPage - 1),
          backImage: null
        })
      } else {
        setFlip({
          ...flip,
          frontImage: pageUrl(leftPage),
          backImage: pageUrl(currentPage - displayedPages + 1)
        })
      }
    } else {
      if (displayedPages === 1) {
        setFlip({
          ...flip,
          frontImage: pageUrl(currentPage),
          backImage: null
        })
      } else {
        setFlip({
          ...flip,
          frontImage: pageUrl(rightPage),
          backImage: pageUrl(currentPage + displayedPages)
        })
      }
    }
    setFlip({
      ...flip,
      direction: direction,
      progress: 0
    })
    return requestAnimationFrame(() => {
      return requestAnimationFrame(() => {
        if (flip.direction === 'left') {
          if (displayedPages === 2) {
            setLeftPage(currentPage - displayedPages)
          }
        } else {
          if (displayedPages === 1) {
            setLeftPage(currentPage + displayedPages)
          } else {
            setRightPage(currentPage + 1 + displayedPages)
          }
        }
        if (auto) {
          return flipAuto(true);
        }
      });
    });
  }

  const flipAuto = ease => {
    var animate, duration, startRatio, t0;
      t0 = Date.now();
      duration = flipDuration * (1 - flip.progress);
      startRatio = flip.progress;
      setFlip({
        ...flip,
        auto: true
      })
      animate = () => {
        return requestAnimationFrame(() => {
          var ratio, t;
          t = Date.now() - t0;
          ratio = startRatio + t / duration;
          if (ratio > 1) {
            ratio = 1;
          }
          setFlip({
            ...flip,
            progress: ease ? easeInOut(ratio) : ratio
          })
          if (ratio < 1) {
            return animate();
          } else {
            if (flip.direction === 'left') {
              setCurrentPage(currentPage - displayedPages)
            } else {
              setCurrentPage(currentPage + displayedPages)
            }
            if (displayedPages === 1 && flip.direction === 'right') {
              setFlip({
                ...flip,
                direction: null
              })
            } else {
              onImageLoad(1, () => {
                setFlip({
                  ...flip,
                  auto: false
                })
                return null;
              });
            }
            setFlip({
              ...flip,
              auto: false
            })
            return false;
          }
        });
      };
      return animate();
  }

  const flipRevert = () => {
    var animate, duration, startRatio, t0;
      t0 = Date.now();
      duration = flipDuration * flip.progress;
      startRatio = flip.progress;
      flip.auto = true;
      animate = () => {
        return requestAnimationFrame(() => {
          var ratio, t;
          t = Date.now() - t0;
          ratio = startRatio - startRatio * t / duration;
          if (ratio < 0) {
            ratio = 0;
          }
          flip.progress = ratio;
          if (ratio > 0) {
            return animate();
          } else {
            setLeftPage(currentPage)
            setRightPage(currentPage + 1)
            if (displayedPages === 1 && flip.direction === 'left') {
              flip.direction = null;
            } else {
              onImageLoad(1, () => {
                return flip.direction = null;
              });
            }
            return flip.auto = false;
          }
        });
      };
      return animate();
  }

  const onImageLoad = (trigger, cb) => {
    setNImageLoad(0)
    setNImageLoadTrigger(trigger)
    setImageLoadCallback(cb)
    return imageLoadCallback
  }

  const didLoadImage = ev => {
    if (!imageLoadCallback) {
      return;
    }
    if (++nImageLoad >= nImageLoadTrigger) {
      imageLoadCallback();
      return null;
    }
  }

  const swipeStart = touch => {
    setTouchStartX(touch.pageX);
    setTouchStartY(touch.pageY);
    return touch.pageY
  }

  const swipeMove = touch => {
    var x, y;
    if (touchStartX == null) {
      return;
    }
    x = touch.pageX - touchStartX;
    y = touch.pageY - touchStartY;
    if (Math.abs(y) > Math.abs(x)) {
      return;
    }
    if (x > 0) {
      if (flip.direction === null && canFlipLeft && x >= 5) {
        flipStart('left', false);
      }
      if (flip.direction === 'left') {
        setFlip({
          ...flip,
          progress: x / this.pageWidth
        })
        if (flip.progress > 1) {
          setFlip({
            ...flip,
            progress: 1
          })
        }
      }
    } else {
      if (flip.direction === null && canFlipRight && x <= -5) {
        flipStart('right', false);
      }
      if (flip.direction === 'right') {
        setFlip({
          ...flip,
          progress: -x / pageWidth
        })
        if (flip.progress > 1) {
          setFlip({
            ...flip,
            progress: 1
          })
        }
      }
    }
    return true;
  }

  const swipeEnd = touch => {
    if (flip.direction !== null && !flip.auto) {
      if (flip.progress > 1 / 4) {
        flipAuto(false);
      } else {
        flipRevert();
      }
    }
    setTouchStartX(null)
    return null;
  }

  const onMouseDown = ev => {
    if (hasPointerEvents) {
      return;
    }
    if (ev.which && ev.which !== 1) {
      return;
    }
    return swipeStart(ev);
  }

  const onMouseMove = ev => {
    if (hasPointerEvents) {
      return;
    }
    if (ev.which && ev.which !== 1) {
      return;
    } // Ignore right-click
    console.log(polygonArray);
    return swipeMove(ev);
  }

  const onMouseUp = ev => {
    if (!hasPointerEvents) {
      return swipeEnd(ev)
    }
  }

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

  return (
    <div
      className="flipbook"
      onMouseDown={ev => onMouseDown(ev)}
      onMouseMove={ev => onMouseMove(ev)}
      onMouseUp={ev => onMouseUp(ev)}
    >
      <div className="viewport">
      <div className="container" style={{ width: '100%' }}>
        <div
          className="centering-box"
          style={{ width: pageWidth * displayedPages }}
        >
          { pageUrl(leftPage) && <img
            className="page fixed"
            style={{
              width: pageWidth + 'px',
              height: pageHeight + 'px',
              left: xMargin + 'px',
              top: spaceTop + 'px'
            }}
            src={pageUrl(leftPage)}
            onLoad={($event) => didLoadImage($event)}
          />}
          { displayedPages === 2 && pageUrl(rightPage) && <img
            className="page fixed"
            style={{
              width: pageWidth + 'px',
              height: pageHeight + 'px',
              left: pageWidth + 'px',
              top: spaceTop + 'px'
            }}
            src={pageUrl(rightPage)}
            onLoad={($event) => didLoadImage($event)}
          />}
              

              {/* <div
                v-for="[key, bgImage, lighting, bgPos, transform, z] in polygonArray"
                class="polygon"
                :key="key"
                :class="{ blank: !bgImage }"
                :style="{
                  backgroundImage: bgImage,
                  backgroundSize: polygonBgSize,
                  backgroundPosition: bgPos,
                  width: polygonWidth,
                  height: polygonHeight,
                  transform: transform,
                  zIndex: z
                }"
              >
                <div
                  class="lighting"
                  v-show="lighting.length"
                  :style="{ backgroundImage: lighting }"
            />
          </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flipbook;
