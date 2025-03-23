var runCodeButton = document.querySelector('#sendButton');
var output_block = document.querySelector('.code #output');

var pageLoaded = false;

var socket = io();

const editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
    lineNumbers: true,
    mode: 'python',
    theme: 'pycar-theme',
    lineWrapping: true, 
    tabSize: 4,
    indentUnit: 4,
    indentWithTabs: false,
    smartIndent: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
    autoCloseBrackets: true,
    hintOptions: {
        completeSingle: false  // Отключаем автоматическое дополнение по первому совпадению
    }
});

editor.on('inputRead', function(cm, change) {
    if (change.text[0].match(/[a-zA-Z0-9_]/)) { // Если вводится буква, цифра или _
        CodeMirror.commands.autocomplete(cm);
    }
    window.localStorage.setItem('code', editor.getValue());
});

// Исполнение кода
runCodeButton.addEventListener('click', async () => {
    if (runCodeButton.classList.contains('deactivated')) return;
    runCodeButton.classList.add('deactivated');

    output_block.innerHTML = '';
    let code = editor.getValue();
    
    socket.emit('execute_code', {code});

    runCodeButton.classList.remove('deactivated');
});

// Получение результата выполнения кода
socket.on('execution_result', function(data) {
    console.log('execution_result', data);
    let cm = document.querySelector('.CodeMirror');

    if (!data.ok) {
        output_block.innerHTML += data.error.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        output_block.classList.add('error');
        cm.style.transition = '.5s';
        cm.style.height = '70%';
        setTimeout(() => {
            cm.style.transition = 'none';
        }, 500);
    }
    else {
        window.gameObjects = data.game_objects;
        window.carControl = window.gameObjects.car;
        output_block.classList.remove('error');
        output_block.innerHTML += data.output.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        cm.style.transition = '.5s';
        cm.style.height = '70%';
        setTimeout(() => {
            cm.style.transition = 'none';
        }, 500);
    }
});

// Получение результата выполнения кода
socket.on('partial_result', function(data) {
    console.log(partial_result, data);
    
    if (data.ok) {
        window.gameObjects = data.game_objects;
        window.carControl = window.gameObjects.car;
    }
});

// Сохранение кода в localStorage
editor.on('change', function(cm, change) {
    if (change.origin !== 'setValue') { 
        window.localStorage.setItem('code', editor.getValue());
    }
});

// Восстановление кода из localStorage
editor.setValue(window.localStorage.getItem('code'));