export function insertIntoFocusedEditor(documentRef = globalThis.document, message) {
  const element = documentRef.activeElement;

  if (!element) {
    return { inserted: false };
  }

  if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
    element.value = message;
    dispatchInput(documentRef, element);
    return { inserted: true };
  }

  if (element.isContentEditable) {
    element.textContent = message;
    dispatchInput(documentRef, element);
    return { inserted: true };
  }

  return { inserted: false };
}

function dispatchInput(documentRef, element) {
  const EventConstructor = documentRef.defaultView?.InputEvent ?? documentRef.defaultView?.Event ?? Event;
  element.dispatchEvent(new EventConstructor("input", { bubbles: true, inputType: "insertText" }));
}
