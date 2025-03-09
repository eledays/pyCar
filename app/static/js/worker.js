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
    const { code } = event.data;

    try {
        const result = await pyodide.runPythonAsync(code);
        
        const gameObjects = await pyodide.runPythonAsync(`
            import json
            json.dumps(gameObjects, default=lambda o: o.__dict__)
        `);
        
        self.postMessage({ type: 'successful code eval', result: result, gameObjects: gameObjects });
    } catch (error) {
        self.postMessage({ type: 'fail code eval', error: error.message });
    }
};