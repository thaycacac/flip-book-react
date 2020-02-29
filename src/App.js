import React, { useState } from "react";
import Flipbook from "./components/Flipbook";
import { Provider } from "unstated";
import "./App.css";

function App() {
  const initPages = [
    null,
    "images/1.jpg",
    "images/2.jpg",
    "images/3.jpg",
    "images/4.jpg",
    "images/5.jpg",
    "images/6.jpg"
  ];

  const [hasMouse, setHasMouse] = useState(true);
  const [pages, setPages] = useState(initPages);

  return (
    <Provider>
      <div
        id="app"
        className={hasMouse ? "has-mouse" : ""}
        onTouchStart={() => setHasMouse(false)}
      >
        <Flipbook pages={pages}/>
        {/* <Demo /> */}
      </div>
    </Provider>
  );
}

export default App;
