if(voting_type == 0) {
    window.limits = [2, 2];
} else {
    window.limits = [3, 10];
}
console.log(`${variantcount} limit:${limits[0]},${limits[1]}`);
function updButtons() {
    document.getElementById('submit-btn').disabled = variantcount < limits[0] || variantcount > limits[1];
    document.getElementById('add-variant-btn').disabled = variantcount >= limits[1];
}
function addInput(before, id, type, lbl) {
    if(variantcount >= limits[1]) {updButtons();return}
    var pdiv = document.createElement('div');
    pdiv.classList.add('mb-3');
    var label = document.createElement('label');
    label.for = id;
    label.innerText = lbl;
    if (voting_type != 0) { // no delete if discrete voting
        var delbtn = document.createElement('button');
        delbtn.onclick = function(event) {event.preventDefault(); pdiv.remove(); variantcount--; updButtons();}
        delbtn.classList.add('btn', 'btn-danger')
        delbtn.innerText = 'Удалить';
        label.appendChild(delbtn);
    }
    pdiv.appendChild(label);
    var inp = document.createElement('input');
    inp.id = id;
    inp.name = id;
    inp.type = type;
    inp.classList.add('form-control');
    inp.required = true;
    pdiv.appendChild(inp);
    before.parentElement.insertBefore(pdiv, before);
    variantcount++;
    updButtons();
    inp.focus()
}
function toggleDeleteStatus(elem) {
    // elem is button
    var parent = elem.parentElement;
    var grandparent = parent.parentElement;
    if (parent.lastElementChild.checked != 0) {
        if (variantcount == limits[1]) {
            alert("Ошибка! У вас слишком много варинтов. Попробуйте удалить другие")
            return false;
        }
        elem.innerText = "Удалить";
        elem.classList.remove("btn-info");
        elem.classList.add("btn-danger");
        parent.lastElementChild.checked = 0;
        grandparent.lastElementChild.hidden = false;
        variantcount++;
    } else {
        if (variantcount == limits[0]) {
            alert("Ошибка! Прежде чем удалить этот вариант, создайте другой")
            return false;
        }
        elem.innerText = "Восстановить";
        elem.classList.remove("btn-danger");
        elem.classList.add("btn-info");
        parent.lastElementChild.checked = 1;
        grandparent.lastElementChild.hidden = true;
        variantcount--;
    }
}

document.getElementById('main-form').reset() // что там firefox курит с возвращением состояния формы?

updButtons(); // апдейтим
