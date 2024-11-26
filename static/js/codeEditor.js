let btn = document.querySelector('#sendButton');
let textarea = document.querySelector('#codeEditor');

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
});

btn.addEventListener('click', () => {
    let code = editor.getValue();

    console.log(JSON.stringify({ code: code }));

    (async function() {
        try {
            const response = await fetch('/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    code: code,
                })
            })

            if (response.ok) {
                
                const r = await response.json();
                console.log(r);
                if (r.error) {
                    alert(r.error);
                }
                console.log(r);
                window.mainCar = r.car;
            }
            else {
                console.log('Ошибка при отправке запроса');
            }
        }
        catch (error) {
            console.error(error);
        }
    })();
})

editor.setValue('# Переменная car содержит экземпляр класса Car и относится к машине, расположенной слева\n\ncar.engine_start()  # запустить двигатель (с незапущенным не поедет)\ncar.set_power(.5)  # задать мощность двигателя\ncar.rotate(0)  # задать угол поворота колес в градусах (не более 30 по модулю)')