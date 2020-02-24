import React, { useState } from 'react'

const Flipbook = () => {

    const [hasTouchEvents, setHasTouchEvents] = useState(false)
    const [touchStartX, setTouchStartX] = useState(null)
    const [touchStartY, setTouchStartY] = useState(null)

    const onTouchStart = (ev) => {
        console.log('onTouchStart', ev);
        setHasTouchEvents(true)
        swipeStart(ev.changedTouches[0])
    }

    const swipeStart = (touch) => {
        setTouchStartX(touch.pageX)
        setTouchStartY(touch.pageY)
    }

    return (
        <div
            onTouchStart={(ev) => onTouchStart(ev)}
        >
            fsdafsdfsdfdsfdsfsdfsdf
        </div>
    )
}

export default Flipbook
