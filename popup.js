'use strict';
let btn;
let addPassword = document.getElementById('addPassword');
document.getElementById('edit').onclick = edit;
chrome.storage.sync.get('superClave', function (data) {
  if (data.superClave != null)
    return;
  let main = document.getElementById('main');
  main.innerHTML = '';
  let btn = document.createElement('button');
  btn.onclick = edit;
  btn.innerHTML = 'Configurar';
  main.appendChild(btn);
});
addPassword.onclick = function (element) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        file: 'get_coordinates.js',
        allFrames: true
      },
      function (data) {
        processCoordinates(data, tabs[0].id);
      });
  });
};
document.addEventListener('keypress', (event) => {
  if (event.keyCode == 13) {
    let modal = document.getElementById('modal');
    if (modal != null && modal.style.display != 'none')
      modal.style.display = 'none';
    else if (btn != null)
      btn.onclick();
  }
});

function processCoordinates(data, tabId) {
  let coors;
  if (data != null && data.length > 0) {
    for (let d of data) {
      if (d != null && d.length == 3) {
        coors = d;
        break;
      }
    }
  }
  if (coors == null)
    return messagePopup('No existe ningun campo de superclave en la pagina');

  for (let co of coors) {
    if (typeof co != 'string')
      return messagePopup('No existe ningun campo de superclave en la pagina');
    if (co.length != 2)
      return messagePopup('No existe ningun campo de superclave en la pagina');
  }
  passEnter((superClave) => {
    const codes = coors.map((c) => { return ('00' + superClave[c[0]][parseInt(c[1]) - 1]).slice(-2); });
    let code = `
    function createEvent(ename) {
      var ev = new Event(ename);
      ev.initEvent(ename, true, false);
      return ev;
    }
    var inputs = document.getElementsByClassName("challengeItem");
    var newSystem = false;
    if (inputs == null || inputs.length != 3) {
        inputs = document.getElementsByClassName("superclave__input");
        newSystem = true;
    }
    if (inputs == null || inputs.length != 3) {      
        inputs = document.getElementsByClassName("superclave_container-input");
        newSystem = true;
    }
    if (inputs == null || inputs.length != 3) {      
        inputs = document.getElementsByClassName("super-clave__input");
        newSystem = true;
    }
    if (inputs != null && inputs.length == 3) {
        for (let i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (newSystem) {
                input.dispatchEvent(createEvent('blur'));
            }
            input.value = codes[i];
            if (newSystem) {
                input.dispatchEvent(createEvent('input'));
                input.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 0 }));
            }
        }
        //this is for the dolar buy case...
        var submitButton = document.getElementById('PER_Aceptar');
        if (submitButton != null) {
            submitButton.disabled = false;
            submitButton.classList.remove("botonInactivo");
        }
    }
    `;
    code = 'var codes = ' + JSON.stringify(codes) + ';' + code;
    chrome.tabs.executeScript(tabId, {
      code: code,
      allFrames: true
    });
    superClave = null;
  })
}
function passEnter(callback) {
  let main = document.getElementById('main');
  let pass = document.createElement('input');
  document.getElementById('edit').style.display = 'none';
  document.body.style.height = '163px';
  pass.autofocus = true;
  btn = document.createElement('button');
  btn.innerHTML = 'ENVIAR';
  pass.type = 'password';
  pass.id = 'pass';
  pass.placeholder = 'Escribe tu password';
  main.innerHTML = '';
  main.append(pass);
  main.appendChild(btn);
  btn.onclick = () => {
    chrome.storage.sync.get('superClave', function (data) {
      if (data.superClave == null) {
        messagePopup("No hay ninguna SuperClave guardada, creala en opciones (click derecho en el icono)");
        return reset();
      }
      pass = document.getElementById('pass');
      let superClave = null;
      try {
        superClave = JSON.parse(decrypt(data.superClave, pass.value));
      }
      catch (e) {
        console.log(e);
      }
      if (superClave == null || superClave.A == null || superClave.A.length != 5) {
        messagePopup("Clave Incorrecta");
        return;
      }
      callback(superClave);
      reset();
      window.close();
    });
  }
}
function reset() {
  let main = document.getElementById('main');
  main.innerHTML = '';
  main.appendChild(addPassword);
  document.body.style.height = '110px';
}
function messagePopup(text) {
  let modal = document.getElementById('modal');
  modal.style.display = 'block';
  modal.innerHTML = '';
  let d = document.createElement('div');
  modal.appendChild(d);
  d.innerHTML = text + "<br>";
  d.className = 'cont';
  let button = document.createElement('button');
  button.innerHTML = 'OK';
  button.onclick = () => {
    modal.style.display = 'none';
  }
  d.appendChild(button);
}
function edit() {
  chrome.tabs.create({ 'url': "/options.html" });
}