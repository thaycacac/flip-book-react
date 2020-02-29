import React, { useEffect, useRef, useState } from "react";
import { Subscribe } from "unstated";
import FlipBookContainer from "../Stores/Flipbook";
import { easeIn, easeInOut, easeOut } from "../helper";
import "./Styles.css";

const FlipBook = ({ pages, flipDuration = 1000, width = 350 }) => {
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
  const [leftPage, setLeftPage] = useState(0);
  const [rightPage, setRightPage] = useState(1);

  const {
    currentPage,
    displayedPages,
    imageHeight,
    imageLoadCallback,
    imageWidth,
    nImageLoad,
    nImageLoadTrigger,
    nPages,
    preloadedImages,
    viewHeight,
    viewWidth,
    currentCenterOffset
  } = FlipBookContainer.state;

  useEffect(() => {
    preloadImages();
  }, []);

  const preloadImages = () => {
    let asc, start, end, i, img, url;
    if (Object.keys(FlipBookContainer.state.preloadedImages).length >= 10) {
      FlipBookContainer.setState({
        preloadImages: {}
      });
    }
    const currentPage = FlipBookContainer.state.currentPage;
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
        if (!FlipBookContainer.state.preloadedImages[url]) {
          img = new Image();
          img.src = url;
          FlipBookContainer.state.preloadedImages[url] = img;
        }
      }
    }
  };

  const pageUrl = page => {
    return pages[page] || null;
  };

  const onMouseMove = ev => {
    if (hasTouchEvents || hasPointerEvents) {
      return;
    }
    if (ev.which && ev.which !== 1) {
      return;
    }
    return swipeMove(ev);
  };

  const onMouseDown = ev => {
    if (hasTouchEvents || hasPointerEvents) {
      return;
    }
    if (ev.which && ev.which !== 1) {
      return;
    } // Ignore right-click
    return swipeStart(ev);
  };

  const swipeMove = touch => {
    if (touchStartX === null) {
      return;
    }
    const x = touch.pageX - touchStartX;
    const y = touch.pageY - touchStartY;
    if (Math.abs(y) > Math.abs(x)) {
      return;
    }
    if (x > 0) {
      console.log("oke", flip.direction, canFlipRight());
      if (flip.direction === null && canFlipLeft() && x >= 5) {
        flipStart("left", false);
      }
      if (flip.direction === "left") {
        setFlip({ ...flip, progress: x / width });
      }
      if (flip.progress > 1) {
        setFlip({ ...flip, progress: 1 });
      }
    } else {
      if (flip.direction === null && canFlipRight() && x <= -5) {
        flipStart("right", false);
      }
      if (flip.direction === "right") {
        setFlip({ ...flip, progress: -x / width });
      }
      if (flip.progress > 1) {
        setFlip({ ...flip, progress: 1 });
      }
    }
    return true;
  };

  const canFlipLeft = () => {
    return (
      !flip.direction &&
      currentPage >= displayedPages &&
      !(displayedPages === 1 && !pageUrl(leftPage - 1))
    );
  };

  // fix
  const canFlipRight = () => {
    return !flip.direction && currentPage < pages.length - displayedPages;
  };

  const flipStart = (dir, auto) => {
    console.log("start", dir);
    if (dir == "left") {
      setFlip({
        ...flip,
        frontImage: leftPage,
        backImage: currentPage - displayedPages + 1
      });
    } else {
      setFlip({
        ...flip,
        frontImage: pageUrl(rightPage),
        backImage: currentPage + displayedPages
      });
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
            FlipBookContainer.setState({
              currentPage: currentPage - displayedPages
            });
          } else {
            FlipBookContainer.setState({
              currentPage: currentPage + displayedPages
            });
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

  const onImageLoad = (trigger, cb) => {
    FlipBookContainer.setState({
      nImageLoad: 0,
      nImageLoadTrigger: trigger,
      imageLoadCallback: cb
    });
  };

  const swipeStart = touch => {
    setTouchStartX(touch.pageX);
    setTouchStartY(touch.pageY);
  };

  return (
    <Subscribe to={[FlipBookContainer]}>
      {flipBookContainer => {
        return (
          <div
            className="flipbook"
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
          >
            <div ref={viewportRef} className="viewport">
              <div className="container">
                <div
                  className="centering-box"
                  style={{
                    transform: `translateX(${Math.round(
                      currentCenterOffset
                    )}px)`
                  }}
                >
                  <div
                    className="bounding-box"
                    style={{ width: displayedPages === 2 ? width * 2 : width }}
                  >
                    {pageUrl(leftPage, true) && displayedPages === 2 && (
                      <img
                        style={{ width: width }}
                        src={pageUrl(leftPage, true)}
                      />
                    )}
                    {pageUrl(rightPage, true) && (
                      <img
                        style={{ width: width }}
                        src={pageUrl(rightPage, true)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Subscribe>
  );
};

export default FlipBook;
