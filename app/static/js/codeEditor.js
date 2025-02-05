var runCodeButton = document.querySelector('#sendButton');
var output_block = document.querySelector('.code #output');

var pageLoaded = false;

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
    
    await evaluatePython(code);

    runCodeButton.classList.remove('deactivated');
});

editor.setValue(baseCodeEditorText);

async function load() {
    // document.querySelector('.loading_block').remove();
    // return;

    let pyodide = await loadPyodide();
    pyodide.setStdout({batched: (str) => output_block.innerHTML += '\n' + str});

    console.log('ready');
    document.querySelector('.loading_block').remove();
    pageLoaded = true;

    pyodide.runPython(basePythonCode);

    setInterval(async () => {
        if (pyodide.globals.get('car')) window.carControl = pyodide.globals.get('car').toJs();
        if (pyodide.globals.get('light')) window.lightControl = pyodide.globals.get('light').toJs();
    }, 50);

    console.log(messages)
    for (let message of messages) {
        if (message.length === 2) {
            setTimeout(() => addMessage(message[0]), message[1]);
        }
        else if (message.length === 3 && message[2] === 'newBlock') {            
            setTimeout(() => addMessage(message[0], 'text', null, false, true), message[1]);
        }
        else if (message.length === 3) {
            setTimeout(() => addMessage(message[0], 'button', message[2]), message[1]);
        }
    }

    editor.setValue(window.localStorage.getItem('code'));

    return pyodide;
};

let pyodideReadyPromise = load();

async function evaluatePython(code) {
    if (window.localStorage.getItem('no_wasm') === true) return;

    let pyodide = await pyodideReadyPromise;
    let cm = document.querySelector('.CodeMirror')
    try {
        console.log(code);
        
        let output = await pyodide.runPythonAsync(code);
        if (output) {
            cm.style.transition = '.5s';
            cm.style.height = '70%';
            setTimeout(() => {
                cm.style.transition = 'none';
            }, 500);
        }
        output_block.classList.remove('error');
    } catch (err) {
        console.log(err);
        output_block.innerHTML = err;
        if (err) {
            cm.style.transition = '.5s';
            cm.style.height = '70%';
        }
        setTimeout(() => {
            cm.style.transition = 'none';
        }, 500);
        output_block.classList.add('error');
    }
}