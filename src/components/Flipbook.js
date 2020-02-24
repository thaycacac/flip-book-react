import React, { useState } from 'react'

const Flipbook = ({ pages, pagesHires }) => {
    const flipInit = {
        progress: 0,
        direction: null,
        frontImage: null,
        backImage: null,
        auto: false
    }

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

    const swipeStart = (touch) => {
        console.log('swipeStart');
        setTouchStartX(touch.pageX)
        setTouchStartY(touch.pageY)
    }

    const canFlipLeft = () => {
        console.log('canFlipLeft');
        return !flip.direction && currentPage >= displayedPages && !(displayedPages === 1 && !pageUrl(leftPage - 1));
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
        } else {
            console.log(flip.direction);
        }
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

    }

    const swipeEnd = (touch) => {

    }

    return (
        <div
            onMouseDown={(ev) => onMouseDown(ev)}
            onMouseMove={(ev) => onMouseMove(ev)}
            onMouseUp={(ev) => onMouseUp(ev)}
        >
            fsdafsdfsdfdsfdsfsdfsdf
        </div>
    )
}

export default Flipbook
