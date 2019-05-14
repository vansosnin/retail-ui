class TabListener {
  public isTabPressed: boolean = false;
  constructor() {
    window.addEventListener('keydown', event => (this.isTabPressed = event.key === 'Tab'));
    // window.addEventListener('keyup', event => (this.isTabPressed = this.isTabPressed && event.key !== 'Tab'));
    window.addEventListener('mousedown', () => Promise.resolve().then(() => {
      this.isTabPressed = false;
      console.log('mouseup');
    }));
    // window.addEventListener('mousedown', () => setTimeout(() => {
    //   this.isTabPressed = false;
    //   console.log('mouseup');
    // }, 0));
  }
}

export default new TabListener();
