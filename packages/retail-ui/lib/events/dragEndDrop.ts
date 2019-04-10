const radius = 5;

let isClicked = false;
let isDragging = false;
let dragndropstartEvent: MouseEvent;

let x1: number;
let y1: number;

const createEvent = (type: string, event: MouseEvent) => {
  if (typeof MouseEvent === 'function') {
    return new MouseEvent(type, event);
  }
  // <IE11
  const e = document.createEvent('MouseEvent');
  e.initEvent(type, true, true);
  return e;
};
const getLength = (x2: number, y2: number): number => {
  return x1 !== undefined && y1 !== undefined ? Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) : 0;
};
const start = (event: MouseEvent) => {
  if (!isClicked) {
    isClicked = true;
    x1 = event.pageX;
    y1 = event.pageY;
    dragndropstartEvent = createEvent('dragndropstart', event);
  }
};
const move = (event: MouseEvent) => {
  if (isClicked && !isDragging && getLength(event.pageX, event.pageY) > radius) {
    isDragging = true;
    isClicked = false;
    if (event.target !== null) {
      event.target.dispatchEvent(dragndropstartEvent);
    }
  }
  if (isDragging) {
    if (event.target !== null) {
      event.target.dispatchEvent(createEvent('dragndropmove', event));
    }
  }
};
const end = (event: MouseEvent) => {
  isClicked = false;
  if (isDragging) {
    isDragging = false;
    if (event.target !== null) {
      event.target.dispatchEvent(createEvent('dragndropend', event));
    }
  }
};
export default function dragEndDrop(elem: HTMLElement) {
  elem.removeEventListener('mousedown', start);
  elem.removeEventListener('mousemove', move);
  elem.removeEventListener('mouseup', end);
  elem.addEventListener('mousedown', start);
  elem.addEventListener('mousemove', move);
  elem.addEventListener('mouseup', end);
}
