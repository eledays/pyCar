var btn = document.querySelector('#sendButton');
var output_block = document.querySelector('.code #output');

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

var cmElement = document.querySelector('.codeEditor');

editor.on('inputRead', function(cm, change) {
    if (change.text[0].match(/[a-zA-Z0-9_]/)) { // Если вводится буква, цифра или _
        CodeMirror.commands.autocomplete(cm);
    }
});

btn.addEventListener('click', async () => {
    old_style = btn.style.display;
    btn.style.display = 'none';

    output_block.innerHTML = '';
    let code = editor.getValue();

    code = code.replace('sleep(', 'await sleep(');

    console.log(code);
    
    await evaluatePython(code);

    btn.style.display = old_style;
});

editor.setValue(baseCodeEditorText);

async function load() {
    if (window.localStorage.getItem('no_wasm') === true) {
        document.querySelector('.loading_block').remove();
        return;
    }

    let pyodide = await loadPyodide();
    pyodide.setStdout({batched: (str) => output_block.innerHTML += '\n' + str})

    console.log('ready');
    document.querySelector('.loading_block').remove();

    pyodide.runPython(basePythonCode);

    setInterval(async () => {
        window.carControl = pyodide.globals.get('car').toJs();
    }, 50);

    return pyodide;
};

let pyodideReadyPromise = load();

async function evaluatePython(code) {
    if (window.localStorage.getItem('no_wasm') === true) return;

    let pyodide = await pyodideReadyPromise;
    let cm = document.querySelector('.CodeMirror')
    try {
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