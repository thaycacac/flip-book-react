import React, { useState } from 'react'
import memoize from 'lodash/memoize'

const Demo = () => {
    const [firstName, setFirstName] = useState('H')
    const [lastName, setLastName] = useState('')

    const first = (ev) => {
        setFirstName(ev.target.value)
    }

    const last = (ev) => {
        setLastName(ev.target.value)
    }

    const fullname = (firstname, lastname) => {
        return firstname + lastname + 'hello'
    }

    const fullnameMemo = memoize(fullname)
    const reaFull = fullnameMemo(firstName, lastName)

    return (
        <>
        <input onChange={e => first(e)}></input>
        <input onChange={e => last(e)}></input>
        <p>{firstName}: {lastName}</p>
        <p>{reaFull}</p>
        </>
    )
}

export default Demo