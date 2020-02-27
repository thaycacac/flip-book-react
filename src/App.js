import React, { useState } from 'react';
import Flipbook from './components/Flipbook'
import Demo from './components/demo'
import './App.css'

function App() {

  const initPages = [
    null,
    'images/1.jpg',
    'images/2.jpg',
    'images/3.jpg',
    'images/4.jpg',
    'images/5.jpg',
    'images/6.jpg'
  ]

  const initPagesHiRes = [
      null,
      'images-large/1.jpg',
      'images-large/2.jpg',
      'images-large/3.jpg',
      'images-large/4.jpg',
      'images-large/5.jpg',
      'images-large/6.jpg'
  ]

  const [hasMouse, setHasMouse] = useState(true)
  const [pages, setPages] = useState(initPages)
  const [pagesHires, setPagesHires] = useState(initPagesHiRes)

  return (
    <div id="app"
      className={hasMouse ? 'has-mouse' : ''}
      onTouchStart={() => setHasMouse(false)}
    >
        <Flipbook
          pages={pages}
          pagesHiRes={pagesHires}
        />
    </div>
  );
}

export default App;
