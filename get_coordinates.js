function validCode(str) {
    if (str == null)
        return;
    if (typeof str != 'string')
        return false;
    str = str.replace(/(\r\n\t|\n|\r\t| )/gm, "");
    if (str.length != 2)
        return false;
    if (str[0].match(/[A-J]/g) != null && str[1].match(/[1-5]/g) != null)
        return str;
    return false;
}
function searchCode(node) {
    let code = validCode(node.innerHTML);
    if (code)
        return code;
    for (let i = 0; i < node.childNodes.length; i++) {
        let code = searchCode(node.childNodes[i]);
        if (code != null)
            return code;
    }
    return null;
}
var coors = [];
var inputs = document.getElementsByClassName("challengeItem");
if (inputs != null && inputs.length == 3) {
    for (let inp of inputs) {
        let node = inp;
        while (node != null && node.childElementCount <= 1) {
            node = node.parentNode;
        }
        if (node == null)
            break;

        let code = searchCode(node);
        if (code != null)
            coors.push(code);
    }
}
coors;