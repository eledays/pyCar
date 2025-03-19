var runCodeButton = document.querySelector('#sendButton');
var output_block = document.querySelector('.code #output');

var pageLoaded = false;

var socket = io();

socket.on('execution_result', function(data) {
    // if (!data.ok) {
    //     output_block.classList.add('error');
    //     output_block.innerHTML = `<pre>${data.error}</pre>`;
    // }
    console.log(data);
});

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
    
    socket.emit('execute_code', {code});

    runCodeButton.classList.remove('deactivated');
});

editor.setValue(baseCodeEditorText);