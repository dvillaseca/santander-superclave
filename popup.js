'use strict';
let btn;
let addPassword = document.getElementById('addPassword');
document.getElementById('edit').onclick = edit;
chrome.storage.sync.get('superClave', function (data) {
  if (data.superClave != null) {
    getCoordinates();
    return;
  }
  let main = document.getElementById('main');
  main.innerHTML = '';
  let btn = document.createElement('button');
  btn.onclick = edit;
  btn.innerHTML = 'Configurar';
  main.appendChild(btn);
});
addPassword.onclick = getCoordinates;
document.addEventListener('keypress', (event) => {
  if (event.keyCode == 13) {
    let modal = document.getElementById('modal');
    if (modal != null && modal.style.display != 'none')
      modal.style.display = 'none';
    else if (btn != null)
      btn.onclick();
  }
});
async function getCoordinates() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    files: ['get_coordinates.js']
  }, function (data) {
    processCoordinates(data, tab.id);
  });
}
function injectFinalCodes(codes) {
  function createEvent(ename) {
    var ev = new Event(ename);
    ev.initEvent(ename, true, false);
    return ev;
  }

  function getInputs(doc) {
    let inputs = doc.getElementsByClassName("challengeItem");
    let newSystem = false;
    if (inputs == null || inputs.length != 3) {
      inputs = doc.getElementsByClassName("superclave__input");
      newSystem = true;
    }
    if (inputs == null || inputs.length != 3) {
      inputs = doc.getElementsByClassName("superclave_container-input");
      newSystem = true;
    }
    if (inputs == null || inputs.length != 3) {
      inputs = doc.getElementsByClassName("super-clave__input");
      newSystem = true;
    }
    if (inputs == null || inputs.length != 3) {
      inputs = doc.querySelectorAll('input[type="password"]');
      newSystem = true;
    }
    if (inputs == null || inputs.length != 3) {
      let iframes = doc.querySelectorAll('iframe');
      for (let i = 0; i < iframes.length; i++) {
        let result = getInputs(iframes[i].contentWindow.document);
        if (result.inputs.length == 3)
          return result;
      }
    }
    return { inputs, newSystem };
  }

  var inputResult = getInputs(document);
  var inputs = inputResult.inputs;
  var newSystem = inputResult.inputs;

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
}
function processCoordinates(frameData, tabId) {
  let frameWithCoors = null;
  for (let frame of frameData) {
    if (frame.result != null && frame.result.length == 3) {
      frameWithCoors = frame;
      break;
    }
  }
  if (frameWithCoors == null)
    return messagePopup('No existe ningun campo de superclave en la pagina');

  for (let co of frameWithCoors.result) {
    if (typeof co != 'string')
      return messagePopup('No existe ningun campo de superclave en la pagina');
    if (co.length != 2)
      return messagePopup('No existe ningun campo de superclave en la pagina');
  }
  passEnter((superClave) => {
    let codes = frameWithCoors.result.map((c) => { return ('00' + superClave[c[0]][parseInt(c[1]) - 1]).slice(-2); });
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId, frameIds: [frameWithCoors.frameId] },
        func: injectFinalCodes,
        args: [codes]
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
        pass.value = "";
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