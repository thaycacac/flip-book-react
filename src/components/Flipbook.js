import React, { useState, useEffect, useRef } from 'react'
import { easeIn, easeInOut, easeOut, _boundingRight, _boundingLeft, _pageScale } from '../helper'
import './Styles.css'

const Flipbook = ({ pages, pagesHires, flipDuration = 1000}) => {

    const flipInit = {
        progress: 0,
        direction: null,
        frontImage: null,
        backImage: null,
        auto: false
    }

    const viewportRef = useRef(null)

    const [hasTouchEvents, setHasTouchEvents] = useState(false)
    const [hasPointerEvents, setHasPointerEvents] = useState(false)
    const [touchStartX, setTouchStartX] = useState(null)
    const [touchStartY, setTouchStartY] = useState(null)
    const [flip, setFlip] = useState(flipInit)
    const [zoom, setZoom] = useState(1)
    const [currentPage, setCurrentPage] = useState(0)
    const [displayedPages, setDisplayedPages] = useState(1)
    const [zooming, setZooming] = useState(false)
    const [leftPage, setLeftPage] = useState(0)
    const [rightPage, setRightPage] = useState(0)
    const [nImageLoad, setNImageLoad] = useState(0)
    const [nImageLoadTrigger, setNImageLoadTrigger] = useState(0)
    const [imageLoadCallback, setImageLoadCallback] = useState(null)
    const [imageWidth, setImageWidth] = useState(null)
    const [imageHeight, setImageHeight] = useState(null)
    const [viewWidth, setViewWidth] = useState(0)
    const [viewHeight, setViewHeight] = useState(0)
    const [nPages, setNPages] = useState(pages.length)
    const [containerWidth, setContainerWidth] = useState('100%')
    const [currentCenterOffset, setCurrentCenterOffset] = useState(null)
    const [minX, setMinX] = useState(Infinity)
    const [maxX, setMaxX] = useState(-Infinity)
    const [preloadedImages, setPreloadedImages] = useState({})

    // computed
    const [pageScale, setPageScale] = useState(_pageScale(displayedPages, viewWidth, viewHeight, imageWidth, imageHeight))
    const [pageWidth, setPageWidth] = useState(Math.round(imageWidth * pageScale))
    const [pageHeight, setPageHeight] = useState(Math.round(imageHeight * pageScale))
    const [xMargin, setXMargin] = useState((viewWidth - pageWidth * displayedPages) / 2)
    const [yMargin, setYMargin] = useState((viewHeight - pageHeight) / 2)
    const [centerOffsetSmoothed, setCenterOffsetSmoothed] = useState(Math.round(currentCenterOffset))
    const [boundingRight, setBoundingRight] = useState(_boundingRight(displayedPages, viewHeight, xMargin, rightPage, maxX, zoom, zooming, pagesHires, pages))
    const [boundingLeft, setBoundingLeft] = useState(_boundingLeft(displayedPages, viewWidth, xMargin, leftPage, minX, zoom, zooming, pagesHires, pages))

    useEffect(() => {
        window.addEventListener('resize', () => onResize(), { passive: true })
        onResize()
        preloadImages()
    }, [])

    useEffect(() => {
        setCenterOffsetSmoothed(Math.round(currentCenterOffset))
    }, [centerOffsetSmoothed])

    useEffect(() => {
        setXMargin((viewWidth - pageWidth * displayedPages) / 2)
    }, [viewWidth, pageWidth, displayedPages])

    useEffect(() => {
        setYMargin((viewHeight - pageHeight) / 2)
    }, [viewHeight, pageHeight])

    useEffect(() => {
        setPageWidth(Math.round(imageWidth * pageScale))
    }, [imageWidth, pageScale])

    useEffect(() => {
        setPageHeight(Math.round(imageHeight * pageScale))
    }, [imageHeight, pageScale])

    useState(() => {
        setPageScale(displayedPages, viewWidth, viewHeight, imageWidth, imageHeight)
    }, [displayedPages, viewWidth, viewHeight, imageWidth, imageHeight])

    useState(() => {
        setBoundingRight(displayedPages, viewHeight, xMargin, rightPage, maxX, zoom, zooming, pagesHires, pages)
    }, [displayedPages, viewHeight, xMargin, rightPage, maxX, zoom, zooming, pagesHires, pages])

    useState(() => {
        setBoundingLeft(displayedPages, viewWidth, xMargin, leftPage, minX, zoom, zooming, pagesHires, pages)
    }, [displayedPages, viewWidth, xMargin, leftPage, minX, zoom, zooming, pagesHires, pages])

    const onMouseDown = (ev) => {
        console.log('onMouseDown', ev);
        if (hasTouchEvents || hasPointerEvents) { return; }
        if (ev.which && (ev.which !== 1)) { return; } // Ignore right-click
        return swipeMove(ev);
    }

    const onMouseMove = (ev) => {
        if (hasTouchEvents || hasPointerEvents) { return; }
        if (ev.which && (ev.which !== 1)) { return; } // Ignore right-click
        return swipeStart(ev);
    }

    const onMouseUp = (ev) => {
        console.log('onMouseMove', ev);
        if (hasTouchEvents || hasPointerEvents) { return; }
        if (ev.which && (ev.which !== 1)) { return; } // Ignore right-click
        return swipeEnd(ev);
    }

    const onResize = () => {
        setViewWidth(viewportRef.current.clientWidth)
        setViewHeight(viewportRef.current.clientHeight)
        setDisplayedPages(viewWidth > viewHeight ? 2 : 1)
        if (displayedPages === 2) {
            setCurrentPage(currentPage &= ~1)
        }
        if (displayedPages === 1 && !pageUrl(leftPage)) {
            setCurrentPage(currentPage + 1)
        }
        setMinX(Infinity)
        setMaxX(-Infinity)
    }

    const preloadImages = () => {
        let asc, start, end, i, img, url
        if (Object.keys(preloadedImages).length >= 10) {
            setPreloadedImages({})
        }
        for (start = currentPage - 3, i = start, end = currentPage + 3, asc = start <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
            url = pageUrl(i);
            if (url) {
                if (!preloadedImages[url]) {
                    img = new Image();
                    img.src = url;
                    preloadedImages[url] = img;
                }
            }
        }
    }

    const swipeStart = (touch) => {
        console.log('swipeStart');
        setTouchStartX(touch.pageX)
        setTouchStartY(touch.pageY)
    }

    const canFlipLeft = () => {
        console.log('canFlipLeft');
        return !flip.direction && currentPage >= displayedPages && !(displayedPages === 1 && !pageUrl(leftPage - 1));
    }

    const canFlipRight = () => {
        console.log('canFlipLeft');
        return !flip.direction && currentPage < nPages - displayedPages
    }

    const pageUrl = (page, hiRes = false) => {
        if (hiRes && zoom > 1 && !zooming) {
            const url = pagesHires[page]
            if (url) return url
        }
        return pages[page] || null
    }
    

    const swipeMove = (touch) => {
        console.log('swipeMove');
        if (zoom > 1) { return }
        if (touchStartX === null) { return }
        const x = touch.pageX - touchStartX
        const y = touch.pageY - touchStartY
        if (Math.abs(y) > Math.abs(x)) { return }
        if (x > 0) {
            if (flip.direction === null && canFlipLeft() && x >= 5) {
                flipStart('left', false)
            }
            if (flip.direction === 'left') {
                setFlip({ ...flip, progress: x / pageWidth })
            }
            if (flip.progress > 1) {
                setFlip({ ...flip, progress: 1 })
            }
        } else {
            if (flip.direction === null && canFlipRight() && x <= -5) {
                flipStart('right', false)
            }
            if (flip.direction === 'right') {
                setFlip({ ...flip, progress: -x / pageWidth })
            }
            if (flip.progress > 1) {
                setFlip({ ...flip, progress: 1 })
            }
        }
        return true
    }
    
    const flipStart = (dir, auto) => {
        if (dir == 'left') {
            if (displayedPages === 1) {
                setFlip({ ...flip, frontImage: pageUrl(currentPage - 1), backImage: null})
            } else {
                setFlip({ ...flip, frontImage: leftPage, backImage: currentPage - displayedPages + 1 })
            }
        } else {
            if (displayedPages === 1) {
                setFlip({ ...flip, frontImage: pageUrl(currentPage), backImage: null})
            } else {
                setFlip({ ...flip, frontImage: pageUrl(rightPage), backImage: currentPage + displayedPages })
            }
        }
        setFlip({ ...flip, direction: dir, progress: 0 })
        return requestAnimationFrame(() => {
            return requestAnimationFrame(() => {
                if (flip.direction === 'left') {
                    if (displayedPages == 2) {
                        setLeftPage(currentPage - displayedPages)
                    }
                } else {
                    if (displayedPages == 1) {
                        setLeftPage(currentPage + displayedPages)
                    } else {
                        setRightPage(currentPage + 1 + displayedPages)
                    }
                }
                if (auto) flipAuto(true)
            })
        })
    }

    const flipAuto = (ease) => {
        const t0 = Date.now()
        const duration = flipDuration * (1 - flip.progress)
        const startRatio = flip.progress
        setFlip({ ...flip, auto: true})
        var animate = () => {
            return requestAnimationFrame(() => {
                const t = Date.now() - t0;
                let ratio = startRatio + (t / duration);
                if (ratio > 1) ratio = 1
                flip.progress = ease ? easeInOut(ratio) : ratio
                if (ratio < 1) {
                    return animate();
                } else {
                    if (flip.duration === 'left') {
                        setCurrentPage(currentPage - displayedPages)
                    } else {
                        setCurrentPage(currentPage + displayedPages)
                    }
                    if (displayedPages === 1 && flip.direction === 'right') {
                        setFlip({ ...flip, direction: null })
                    } else {
                        onImageLoad(1, () => flip.direction === null)
                    }
                    setFlip({ ...flip, auto: false})
                }
            })
        }
        return animate()
    }

    const didLoadImage = (ev) => {
        if (imageWidth === null) {
            setImageWidth((ev.target || ev.path[0]).naturalWidth)
            setImageHeight((ev.target || ev.path[0]).naturalHeight)
        }
        if (!imageLoadCallback) { return }
        if (++nImageLoad >= nImageLoadTrigger) {
            setImageLoadCallback(null)
        }
    }

    const onImageLoad = (trigger, cb) => {
        setNImageLoad(0)
        setNImageLoadTrigger(trigger)
        setImageLoadCallback(cb)
    }

    const swipeEnd = (touch) => {

    }

    const test = () => {
        return zoom
    }

    return (
        <div
            onMouseDown={(ev) => onMouseDown(ev)}
            onMouseMove={(ev) => onMouseMove(ev)}
            onMouseUp={(ev) => onMouseUp(ev)}
        >
            <button onClick={test}>test</button>
            <div className="viewport" ref={viewportRef} className={ zooming || zoom > 1 ? 'zoom' : '' }>
                <div className="container" style={{
                    transform: `scale(${zoom})`,
                    width: containerWidth
                }}
                >
                    <div className="centering-box" style={{
                        transform: `translateX(${centerOffsetSmoothed}px)`
                    }}
                    >
                        <div className="bounding-box" style={{
                            left: boundingLeft + 'px',
                            top: yMargin + 'px',
                            width: boundingRight - boundingLeft + 'px',
                            height: pageHeight + 'px'
                        }}
                        >
                            {pageUrl(leftPage, true) && <img
                                className="page fixed"
                                style={{
                                    width: pageWidth + 'px',
                                    height: pageHeight + 'px',
                                    left: xMargin + 'px',
                                    top: yMargin + 'px'
                                }}
                                src={pageUrl(leftPage, true)}
                                onLoad={($event) => didLoadImage($event)}
                            />}
                            {pageUrl(leftPage, true) && displayedPages === 2 && <img
                                className="page fixed"
                                style={{
                                    width: pageWidth + 'px',
                                    height: pageHeight + 'px',
                                    left: viewWidth / 2 + 'px',
                                    top: yMargin + 'px'
                                }}
                                src={pageUrl(leftPage, true)}
                                onLoad={($event) => didLoadImage($event)}
                            />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Flipbook
