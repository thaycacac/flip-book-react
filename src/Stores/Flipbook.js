import { Container } from "unstated";

class FlipBookStore extends Container {
  state = {
    containerWidth: "100%",
    currentCenterOffset: null,
    currentPage: 0,
    displayedPages: 1,
    flip: {
      progress: 0,
      direction: null,
      frontImage: null,
      backImage: null,
      auto: false
    },
    imageHeight: null,
    imageLoadCallback: null,
    imageWidth: null,
    leftPage: 0,
    rightPage: 1,
    maxX: -Infinity,
    minX: Infinity,
    nImageLoad: 0,
    nImageLoadTrigger: 0,
    nPages: 0,
    nZooms: 1,
    preloadedImages: {},
    viewHeight: 0,
    viewWidth: 0,
    zoom: 1,
    zoomIndex: 0,
    zooming: false,
    pageScale: 1
  };
}

const FlipBookContainer = new FlipBookStore();

export default FlipBookContainer;
window.thaycacac = FlipBookContainer;
