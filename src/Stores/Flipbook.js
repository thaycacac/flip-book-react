import { Container } from "unstated"

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

class FlipBookStore extends Container {
  state = {
    pageWidth: 640,
    pageHeight: 906,
    pages: initPages,
    leftPage: 0,
    rightPage: 1
  };
}

const FlipBookContainer = new FlipBookStore();

export default FlipBookContainer;
window.thaycacac = FlipBookContainer;
