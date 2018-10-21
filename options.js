'use strict';

let newBtn;
let loadBtn;
let saveBtn;
let inputs = {};
var pass1;
var pass2;
let main;
let io;
document.addEventListener('DOMContentLoaded', function (e) {
  main = document.getElementById('main');
  io = document.getElementById('io');
  pass1 = document.getElementById('pass1');
  newBtn = document.getElementById('new');
  loadBtn = document.getElementById('load');
  saveBtn = document.createElement('button');
  saveBtn.innerHTML = 'Guardar';
  newBtn.onclick = createNew;
  loadBtn.onclick = load;
  saveBtn.onclick = save;
})
function createNew() {
  main.innerHTML = '';
  io.innerHTML = '';
  inputs = {};
  let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  let numbers = [1, 2, 3, 4, 5];
  let table = document.createElement('table');
  main.appendChild(table);
  let tr = document.createElement('tr');
  table.appendChild(tr);
  let td = document.createElement('td');
  td.innerHTML = ' ';
  tr.appendChild(td);
  for (let l of letters) {
    let td = document.createElement('td');
    tr.appendChild(td);
    td.style.fontWeight = 'bold';
    td.innerHTML = l;
    inputs[l] = [];
  }
  for (let n of numbers) {
    let tr = document.createElement('tr');
    table.appendChild(tr);
    let td = document.createElement('td');
    tr.appendChild(td);
    td.innerHTML = n;
    td.style.fontWeight = 'bold';
    for (let l of letters) {
      let td = document.createElement('td');
      tr.appendChild(td);
      let input = document.createElement('input');
      td.appendChild(input);
      input.maxLength = 2;
      input.minLength = 2;
      input.type = 'text';
      inputs[l].push(input);
    }
  }
  //pass1.value = '';
  io.innerHTML = 'Clave: ';
  pass1 = document.createElement('input');
  pass1.type = 'password';
  pass1.maxLength = 30;
  pass1.minLength = 6;
  pass1.id = 'pass1';
  pass1.placeholder = '6 caracteres minimo';
  io.appendChild(pass1);
  io.innerHTML += '<br>Confirma Clave: ';

  pass2 = document.createElement('input');
  pass2.type = 'password';
  pass2.maxLength = 30;
  pass2.minLength = 6;
  pass2.id = 'pass2';
  pass2.placeholder = '6 caracteres minimo';
  io.appendChild(pass2);
  io.innerHTML += '<br>';
  io.appendChild(saveBtn);
}
function load() {
  chrome.storage.sync.get('superClave', function (data) {
    if (data.superClave == null) {
      messagePopup("No hay ninguna clave guardada");
      return;
    }
    let superClave = null;
    try {
      superClave = JSON.parse(decrypt(data.superClave, pass1.value));
    }
    catch (e) {
      console.log(e);
    }
    if (superClave == null || superClave.A == null || superClave.A.length != 5) {
      messagePopup("Clave Incorrecta")
      return;
    }
    createNew();
    for (let letter in inputs) {
      for (let i = 0; i < inputs[letter].length; i++) {
        inputs[letter][i].value = superClave[letter][i];
      }
    }
  });
}
function save() {
  pass1 = document.getElementById('pass1');
  pass2 = document.getElementById('pass2');
  if (pass1.value != pass2.value || pass1.value.length < 6) {
    messagePopup('Clave no coincide o es muy corta');
    return;
  }
  let superClave = {};
  let index = 0;
  for (let letter in inputs) {
    index=1;
    if (superClave[letter] == null)
      superClave[letter] = [];
    for (let c of inputs[letter]) {
      let val = parseInt(c.value);
      if (isNaN(val)) {
        messagePopup('Error en ' + letter + index);
        return;
      }
      superClave[letter].push(val);
      index++;
    }
  }
  chrome.storage.sync.set({ superClave: encrypt(JSON.stringify(superClave), pass1.value) });
  messagePopup("SuperClave Guardada!");
}
function messagePopup(text) {
  let modal = document.getElementById('modal');
  modal.style.display = 'block';
  modal.innerHTML = text + "<br>";
  let button = document.createElement('button');
  button.innerHTML = 'OK';
  button.onclick = () => {
    modal.style.display = 'none';
  }
  modal.appendChild(button);
}