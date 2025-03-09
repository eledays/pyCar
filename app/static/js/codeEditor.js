const worker = new Worker('/static/js/worker.js');

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

runCodeButton.addEventListener('click', async () => {
    let code = editor.getValue();
    worker.postMessage({ code: code });
});

editor.setValue(baseCodeEditorText);

editor.on('inputRead', function(cm, change) {
    if (change.text[0].match(/[a-zA-Z0-9_]/)) { // Если вводится буква, цифра или _
        CodeMirror.commands.autocomplete(cm);
    }
    window.localStorage.setItem('code', editor.getValue());
});

worker.onmessage = (event) => {
    if (event.data.type === 'loaded') {
        document.querySelector('.loading_block').remove();
        worker.postMessage({code: basePythonCode});
        editor.setValue(window.localStorage.getItem('code'));
        // event.pyodide.setStdout({batched: (str) => output_block.innerHTML += '\n' + str});
    }

    else if (event.data.type === 'successful code eval') {
        let globals = JSON.parse(event.data.globals);
        console.log(globals);
        
        setInterval(async () => {
            if (globals.get('car')) window.carControl = globals.get('car').toJs();
            if (globals.get('light')) window.lightControl = globals.get('light').toJs();
        }, 50);
    }

    const outputElement = document.getElementById('output');
    if (event.data.error) {
        let cm = document.querySelector('.CodeMirror');
        outputElement.textContent = `Error: ${event.data.error}`;
        output_block.classList.add('error');
        cm.style.transition = '.5s';
        cm.style.height = '70%';
        setTimeout(() => {
            cm.style.transition = 'none';
        }, 500);
    } else {
        outputElement.textContent = event.data.result || 'Code executed successfully!';
    }
};