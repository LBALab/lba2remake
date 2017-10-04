export function clearContent(elem) {
    while (elem.hasChildNodes()) {
        elem.removeChild(elem.lastChild);
    }
}
