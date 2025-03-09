importScripts('https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js');

let pyodide;
async function initializePyodide() {
    pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
    });
    self.postMessage({ type: 'loaded' });
    pageLoaded = true;
}

initializePyodide();

self.onmessage = async (event) => {
    const { code } = event.data;

    try {
        const result = await pyodide.runPythonAsync(code);
        const gameObjects = pyodide.globals.get('gameObjects');
        
        for (let i = 0; i < gameObjects.length; i++) {
            console.log(gameObjects[i]);
        }    
        const car = pyodide.globals.get('car');
        console.log(car);
        
        
        self.postMessage({ type: 'successful code eval', result: result, gameObjects: gameObjects });
    } catch (error) {
        self.postMessage({ type: 'fail code eval', error: error.message });
    }
};