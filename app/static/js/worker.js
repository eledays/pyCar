importScripts('https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js');

var states = [];

let pyodide;
async function initializePyodide() {
    pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
    });
    self.postMessage({ type: 'loaded' });
    pageLoaded = true;
    pyodide.globals.set("js_callback", (data) => self.postMessage({type: 'partial code eval', gameObjects: data}));
    pyodide.globals.set("js_get_state", () => {
        const copy = [...states];
        states = []
        return copy;
    });
}

initializePyodide();

self.onmessage = async (event) => {
    console.log('worker hi');
    
    if (event.data.type === 'change_state') {
        let light = pyodide.globals.get('light');
        light.set_color(light.GREEN);
        return;
    }

    const { code } = event.data;

    try {
        const asyncCode = `
async def async_wrapper():
    ${code.replace(/\n/g, '\n    ')}
await async_wrapper()
        `;        
        
        let result = null;
        if (event.data.async) {
            result = await pyodide.runPythonAsync(asyncCode);
        }
        else {
            result = await pyodide.runPythonAsync(code);
        }
        
        const gameObjects = await pyodide.runPythonAsync(`
            import json
            json.dumps(gameObjects, default=lambda o: o.__dict__)
        `);
        
        if (event.data.no_result) return;
        self.postMessage({ type: 'successful code eval', result: result, gameObjects: gameObjects });
    } catch (error) {
        console.log(error);
        
        self.postMessage({ type: 'fail code eval', error: error.message });
    }
};

// УБРАТЬ
// let iId = setInterval(() => {
//     let light = pyodide.globals.get('light');
//     if (light.color === light.RED) {
//         states.push('light_green');
//     }
//     else {
//         states.push('light_red');
//     }
// }, 3000);
