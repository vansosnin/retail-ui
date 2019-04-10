export const selectNodeContents = (node: HTMLElement | null) => {
  if (!node) {
    return;
  }
  if (document.createRange) {
    const selection = window.getSelection();
    const range = window.document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
    return;
  }

  // @ts-ignore
  if (typeof document.body.createTextRange === 'function') {
    // @ts-ignore
    const range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
    return;
  }
};

export const selectNode = (node: HTMLElement, start: number = 0, end: number = 0) => {
  if (document.createRange) {
    const selection = window.getSelection();
    const range = window.document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    selection.removeAllRanges();
    selection.addRange(range);
    return;
  }

};

export const removeAllSelections = () => {
  if (typeof window.getSelection === 'function') {
    window.getSelection().removeAllRanges();
  }
};
