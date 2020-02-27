import React, { useEffect, useRef } from "react";
import { Subscribe } from "unstated";
import FlipBookContainer from "../Stores/Flipbook";

const FlipBook = ({ pages, pagesHires, flipDuration = 1000 }) => {
  const viewportRef = useRef(null);

  const {
    currentPage,
    displayedPages,
    flip: { progress, direction, frontImage, backImage, auto },
    imageHeight,
    imageLoadCallback,
    imageWidth,
    leftPage,
    maxX,
    minX,
    nImageLoad,
    nImageLoadTrigger,
    nPages,
    nZooms,
    preloadedImages,
    rightPage,
    viewHeight,
    viewWidth
  } = FlipBookContainer.state;

  useEffect(() => {
    async function handleResize() {
      window.addEventListener("resize", () => onResize(), { passive: true });
      console.log(viewportRef.current.clientWidth);
      await FlipBookContainer.setState({
        viewWidth: viewportRef.current.clientWidth,
        viewHeight: viewportRef.current.clientHeight
      });
      await onResize();
      preloadImages();
    }
    handleResize();
  }, []);

  const onResize = async () => {
    await changeView();
    await changePageScale();
  };

  const changeView = () => {
    async function handleChangeView() {
      await FlipBookContainer.setState({
        displayedPages:
          FlipBookContainer.state.viewWidth > FlipBookContainer.state.viewHeight
            ? 2
            : 1
      });
      if (FlipBookContainer.state.displayedPages === 2) {
        await FlipBookContainer.setState({
          currentPage: currentPage & ~1
        });
      }
      if (FlipBookContainer.state.displayedPages === 1 && !pageUrl(leftPage)) {
        await FlipBookContainer.setState({
          currentPage: currentPage + 1
        });
      }
      await FlipBookContainer.setState({ minX: Infinity });
      await FlipBookContainer.setState({
        maxX: -Infinity
      });
    }
    handleChangeView();
  };

  const changePageScale = () => {
    const vw =
      FlipBookContainer.state.viewWidth /
      FlipBookContainer.state.displayedPages;
    const xScale = vw / imageWidth;
    console.log(FlipBookContainer.state.imageWidth);
    const yScale = viewHeight / imageHeight;
    const scale = xScale < yScale ? xScale : yScale;
    if (scale < 1) {
      FlipBookContainer.setState({ pageScale: scale });
    } else {
      FlipBookContainer.setState({ pageScale: 1 });
    }
  };

  const didLoadImage = async ev => {
    if (imageWidth === null) {
      await FlipBookContainer.setState({
        imageWidth: (ev.target || ev.path[0]).naturalWidth
      });
      await FlipBookContainer.setState({
        imageHeight: (ev.target || ev.path[0]).naturalHeight
      });
    }
    if (!imageLoadCallback) {
      return;
    }
    if (++nImageLoad >= nImageLoadTrigger) {
      await FlipBookContainer.setState({
        imageLoadCallback: null
      });
    }
  };

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

  return (
    <Subscribe to={[FlipBookContainer]}>
      {flipBookContainer => {
        return (
          <div className="flipbook">
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
                    // style={{
                    //   left: boundingLeft + "px",
                    //   top: yMargin + "px",
                    //   width: boundingRight - boundingLeft + "px",
                    //   height: pageHeight + "px"
                    // }}
                  >
                    {/* {pageUrl(leftPage, true) && displayedPages === 2 && ( */}
                    <img
                      className="page fixed"
                      // style={{
                      //   width: pageWidth + "px",
                      //   height: pageHeight + "px",
                      //   left: xMargin + "px",
                      //   top: yMargin + "px"
                      // }}
                      src={pageUrl(leftPage, true)}
                      onLoad={$event => didLoadImage($event)}
                    />
                    {/* )} */}
                    {/* {pageUrl(rightPage, true) && ( */}
                    <img
                      className="page fixed"
                      // style={{
                      //   width: pageWidth + "px",
                      //   height: pageHeight + "px",
                      //   left: viewWidth / 2 + "px",
                      //   top: yMargin + "px"
                      // }}
                      src={pageUrl(rightPage, true)}
                      onLoad={$event => didLoadImage($event)}
                    />
                    {/* )} */}
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
