var runCodeButton = document.querySelector('#sendButton');
var output_block = document.querySelector('.code #output');

var pageLoaded = false;

const socket = new WebSocket("ws://localhost:5000/socket.io/?EIO=4&transport=websocket"); 

socket.onopen = () => console.log("WebSocket подключен");

socket.onmessage = event => {
    if (event.data.startsWith("0")) return;  // Открытие соединения    

    const data = JSON.parse(event.data);
    if (data.result) {
        document.getElementById("output").textContent = data.result;
    }
};

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

runCodeButton.addEventListener('click', async () => {
    if (runCodeButton.classList.contains('deactivated')) return;
    runCodeButton.classList.add('deactivated');

    output_block.innerHTML = '';
    let code = editor.getValue();
    
    socket.send(JSON.stringify({ code: code }));

    runCodeButton.classList.remove('deactivated');
});

editor.setValue(baseCodeEditorText);