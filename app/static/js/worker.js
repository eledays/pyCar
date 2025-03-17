importScripts('https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js');

let pyodide;
async function initializePyodide() {
    pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
    });
    self.postMessage({ type: 'loaded' });
    pageLoaded = true;
    pyodide.globals.set("js_callback", (data) => self.postMessage({type: 'partial code eval', gameObjects: data}));
}

initializePyodide();

self.onmessage = async (event) => {    
    if (event.data.type === 'change_state') {
        let light = pyodide.globals.get('light');
        light.set_color(light.GREEN);
        return;
    }
    else if (event.data.type === 'connect') {
        pyodide.globals.set("js_get_state", () => {
            return [event.data.states.pop(0)];
        });
    }

    const { code } = event.data;

    try {        
        const result = await pyodide.runPythonAsync(code);
        
        
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
//     console.log(pyodide.globals.get('alive')());
    
//     let light = pyodide.globals.get('light');
//     if (light.color === light.RED) {
//         if (pyodide.globals.get('alive')()) pyodide.globals.get('light').set_color(light.GREEN);
//         else states.push('light_green');
//     }
//     else {
//         if (pyodide.globals.get('alive')()) pyodide.globals.get('light').set_color(light.RED);
//         else states.push('light_red');
//     }
// }, 500);

setInterval(() => {console.log('alive'), 100});