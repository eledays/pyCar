function smoothScrollTo(element, target, duration) {
    let start = element.scrollTop;
    let change = target - start;
    let startTime = performance.now();

    function animateScroll(currentTime) {
        let elapsedTime = currentTime - startTime;
        let progress = Math.min(elapsedTime / duration, 1);

        let easeInOutProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        element.scrollTop = start + change * easeInOutProgress;

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}

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

function addMessage(message, type='text', autodelete=null) {
    let messagesBlock = document.querySelector('.messages');

    if (type === 'button' && autodelete === null) {
        autodelete = true;
    }

    let newMsg = null;
    if (type === 'text') {
        newMsg = document.createElement('p')
        newMsg.innerHTML = message;
        messagesBlock.appendChild(newMsg);
    
        smoothScrollTo(messagesBlock, messagesBlock.scrollHeight - messagesBlock.clientHeight - 30, 1000);
    }
    else if (type === 'button') {
        newMsg = document.createElement('button');
        newMsg.innerText = message;
        newMsg.className = 'nextBtn';
        newMsg.addEventListener('click', openCodeEditor);
        messagesBlock.appendChild(newMsg);
    
        smoothScrollTo(messagesBlock, messagesBlock.scrollHeight - messagesBlock.clientHeight, 1000);
    }
}

var levelId = 1;
var fixedCamera = true;

var canvas = document.querySelector('canvas');
var btnField = document.querySelector('.btnField');
var codeMirror = null;
var guideText = document.querySelector('.guide-text');

const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;

const engine = Engine.create();
engine.world.gravity.y = 0; // Отключаем гравитацию
const world = engine.world;

// Рендеринг
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width,
        height,
        wireframes: false, // Визуализация с текстурами
        background: '#000'
    },
});
Render.run(render);
Runner.run(Runner.create(), engine);

var road = Bodies.rectangle(
    window.innerWidth / 2, window.innerHeight / 4, 40, 80, 
    {
        render: {
            sprite: {
                texture: '/static/assets/road_3000.png', 
            },
            fillStyle: null
        },
        isStatic: true,
        collisionFilter: {
            group: -1,
            category: 0x0001,
            mask: 0x0000
        }
    }
);
World.add(world, road);

function createCar(x, y, color=null) {
    color = color || 'white';
    return Bodies.rectangle(
        x, y, 40, 80, 
        {
            friction: 0.2,
            render: {
                sprite: {
                    texture: `/static/assets/${color}_car.png`,
                    xScale: 80 / 100,
                    yScale: 40 / 50,
                },
                angle: 0,
                fillStyle: null
            }
        }
    );
}

var mainCar = null;

var rightCars = [
    // createCar(-80, window.innerHeight / 2 + 80 - window.innerHeight / 4, 'dark_white'),
    // createCar(-window.innerWidth / 2 - 80, window.innerHeight / 2 + 80 - window.innerHeight / 4, 'dark_white')
];

var leftCars = [
    // createCar(window.innerWidth + 80, window.innerHeight / 2 - 80 - window.innerHeight / 4, 'dark_white'),
    // createCar(1.5 * window.innerWidth + 80, window.innerHeight / 2 - 80 - window.innerHeight / 4    , 'dark_white'),
]

rightCars.forEach((e) => {
    World.add(world, e);
    Body.setAngle(e, Math.PI / 2);
});

leftCars.forEach((e) => {
    World.add(world, e);
    Body.setAngle(e, -Math.PI / 2);
});

let speed = 0;
let wheelAngle = 0;

let userMove = false;

// Константы
const maxWheelAngle = Math.PI / 6;
const maxSpeed = 5;
const acceleration = 0.05;
const deceleration = 0.05;
const wheelRotateSpeed = 0.06;

var carStopped = false;

Events.on(engine, 'beforeUpdate', () => {
    if (mainCar === null) return;

    if (mainCar.position.x > 80 && !carStopped) {
        Body.setVelocity(mainCar, {x: Math.max(mainCar.velocity.x - .01, 0), y: 0});
        if (mainCar.velocity.x === 0) {
            carStopped = true;
        }
    }
    else if (!carStopped) {
        Body.setVelocity(mainCar, {x: 3, y: 0});
    }
    // Body.setVelocity(mainCar, {x: Math.min(mainCar.velocityX, 10), y: 0});
    console.log(mainCar.force.x);
    

    rightCars.forEach((e) => {
        Body.setVelocity(e, {x: 5, y: 0});
        if (e.position.x > window.innerWidth + 280) {
            Body.setPosition(e, {x: -80, y: e.position.y});
        }
    });
    leftCars.forEach((e) => {
        Body.setVelocity(e, {x: -5, y: 0});
        if (e.position.x < -280) {
            Body.setPosition(e, {x: window.innerWidth + 80, y: e.position.y});
        }
    });

    if (userMove) {
        Body.setVelocity(mainCar, {x: Math.min(mainCar.velocity.x + .1, 3), y: 0});
    }

    const velocity = Body.getVelocity(mainCar);
    const currentSpeedX = velocity.x;
    const currentSpeedY = velocity.y;

    // Направление машины (угол)
    const angle = mainCar.angle;

    // Вектор направления машины: косинус и синус угла
    const directionX = Math.sin(angle);
    const directionY = -Math.cos(angle);

    // Скалярное произведение скорости и направления
    speed = (currentSpeedX * directionX + currentSpeedY * directionY);
    

    if (window.carControl) {
        if (window.carControl.power && window.carControl.power > 0) {
            speed = Math.min(speed + acceleration * window.carControl.power * window.carControl.engine_started, maxSpeed);
        }
        else if (window.carControl.power && window.carControl.power < 0) {            
            speed = Math.max(speed + acceleration * window.carControl.power * window.carControl.engine_started, -maxSpeed);
        }
        else {
            if (speed > 0) speed = Math.max(speed - deceleration, 0);
            if (speed < 0) speed = Math.min(speed + deceleration, 0);
        }
        Body.setAngle(mainCar, -Math.PI / 2);

        if (wheelAngle < window.carControl.wheel_angle) {
            wheelAngle = Math.min(wheelAngle + wheelRotateSpeed, maxWheelAngle);
        } else if (wheelAngle > window.carControl.wheel_angle) {
            wheelAngle = Math.max(wheelAngle - wheelRotateSpeed, -maxWheelAngle);
        } else {
            wheelAngle *= 0.9;
        }
    }

    const turnRadius = mainCar.width / Math.tan(wheelAngle);

    if (Math.abs(wheelAngle) > 0.01) {
        const angularVelocity = speed / turnRadius; // Угловая скорость
        console.log(mainCar);
        Body.setAngularVelocity(mainCar, angularVelocity);
    } else {
        // Прямолинейное движение
        Body.setAngularVelocity(mainCar, 0); 
    }

    const velocityX = Math.sin(angle) * speed;
    const velocityY = Math.cos(angle) * speed;
    Body.setVelocity(mainCar, { x: velocityX, y: velocityY });

    if (!fixedCamera) {
        const { x, y } = mainCar.position;
        Render.lookAt(render, {
            min: { x: x - width / 2, y: y - height / 2 },
            max: { x: x + width / 2, y: y + height / 2 },
        });
    }
});

var capTitle = document.querySelector('.cap h1');
setTimeout(() => {
    capTitle.style.transition = '2s';
    capTitle.style.opacity = 1;
    setTimeout(() => {
        capTitle.style.opacity = 0;
        document.querySelector('.cap').style.transition = '5s';
        document.querySelector('.cap').style.opacity = 0;
        setTimeout(() => {
            document.querySelector('.cap').remove();
        }, 5100);

        addMessage('Привет!');
        setTimeout(() => addMessage('Добро пожаловать в pyCar — игру, которая поможет тебе научиться программировать на Python'), 2000);
        setTimeout(() => addMessage('Здесь ты будешь управлять машинкой с помощью кода'), 4000);
        setTimeout(() => addMessage('Прежде чем начать, давай разберём пару важных понятий:<br><br>Объект — это что-то из игрового мира, например, машинка, дорога или светофор<br><br>У объектов есть функции — это действия, которые они могут выполнять.<br>Например:<br>- У машинки есть функция move, чтобы ехать<br>- У светофора есть функция set_green, чтобы включить зелёный свет'), 6000);
        setTimeout(() => addMessage('Объект машинки называется <span class="codeText">car</span>. Чтобы выполнить (вызвать) функцию у объекта, нужно написать <span class="codeText">[название объекта].[название функции]()</span>, например, <span class="codeText">car.move()</span>'), 10000);
        setTimeout(() => addMessage('Далее', type='button'), 11000);

        mainCar = createCar(-100, window.innerHeight / 2 + 80 - window.innerHeight / 4, 'yellow');
        mainCar.width = mainCar.bounds.max.x - mainCar.bounds.min.x;
        mainCar.height = mainCar.bounds.max.y - mainCar.bounds.min.y;
        World.add(world, mainCar);
        Body.setAngle(mainCar, Math.PI / 2);
    }, 5000);
}, 500);


function openCodeEditor() {
    let cm = document.querySelector('.CodeMirror');
    let messagesBlock = document.querySelector('.messages');

    cm.style.transition = '3s';
    cm.style.transform = 'translateX(0)';

    messagesBlock.style.transition = '3s';
    messagesBlock.style.left = '25vw';

    messagesBlock.removeChild(messagesBlock.lastChild);

    setTimeout(() => {
        addMessage('Это появилось окно для написания кода. Заставь машину двинуться (напиши код)')
    }, 3000);

    editor.on('change', () => {
        if ('car.move()' == editor.getValue()) {
            document.querySelector('#sendButton').removeAttribute('hidden');
            addMessage('Правильно! Запусти код кнопкой снизу');

            document.querySelector('#sendButton').addEventListener('click', () => {
                userMove = true;
                setTimeout(() => {
                    let finishMsg = document.querySelector('.finishMsg');                    
                    finishMsg.removeAttribute('hidden');
                    console.log('asdf');
                    
                    setTimeout(() => {
                        finishMsg.style.opacity = 0;
                        finishMsg.style.transition = '1s';
                        finishMsg.style.opacity = 1;
                    }, 10);
                    setTimeout(() => {
                        window.location.href = '/2'
                    }, 9000);
                }, 3000);
            });
        }
    });
}