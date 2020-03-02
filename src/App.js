import React, { useState } from "react";
import Flipbook from "./components/Flipbook";
import { Provider } from "unstated";
import "./App.css";

function App() {
  const initPages = [
    null,
    {
      url: "images/1.jpg",
      id: '8182045543'
    },
    {
      url: "images/2.jpg",
      id: "4591469984"
    },
    {
      url: "images/3.jpg",
      id: "3816263638"
    },
    {
      url: "images/4.jpg",
      id: "7912047691"
    },
    {
      url: "images/5.jpg",
      id: "4944943318"
    },
    {
      url: "images/6.jpg",
      id: "3800999370"
    }
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
