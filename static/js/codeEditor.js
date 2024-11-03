let btn = document.querySelector('#sendButton');
let textarea = document.querySelector('#codeEditor');

btn.addEventListener('click', () => {
    let code = textarea.value;

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
                const r = await response.json()
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