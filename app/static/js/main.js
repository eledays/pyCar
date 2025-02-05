const { Engine, Render, Runner, World, Bodies, Body, Events, Constraint, Composite } = Matter;

const width = window.innerWidth / 2;
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

// Создаём границы
// const borders = [
//     Bodies.rectangle(width / 2, 0, width, 50, { isStatic: true }),
//     Bodies.rectangle(width / 2, height, width, 50, { isStatic: true }),
//     Bodies.rectangle(0, height / 2, 50, height, { isStatic: true }),
//     Bodies.rectangle(width, height / 2, 50, height, { isStatic: true }),
// ];
// World.add(world, borders);

var car = null;
var glow = null;
let mainLight = null;

for (obj of objects) {
    if (obj.type === 'car') {
        glow = Bodies.rectangle(obj.x, obj.y - 70, obj.width, obj.height, {
            isSensor: true,
            render: {
                sprite: {
                    texture: '/static/assets/glow.png', 
                    xScale: obj.width / 100,
                    yScale: obj.height / 50,
                },
                fillStyle: null,
                opacity: 0
            },
        });
        World.add(world, glow);

        car = Bodies.rectangle(obj.x, obj.y, obj.width, obj.height, {
            friction: 0.02, // Трение
            render: {
                sprite: {
                    texture: '/static/assets/white_car.png', 
                    xScale: obj.width / 100,
                    yScale: obj.height / 50,
                },
                fillStyle: null
            },
        });
        car.width = car.bounds.max.x - car.bounds.min.x;
        car.height = car.bounds.max.y - car.bounds.min.y;
        Body.setAngle(car, obj.rotate);
        World.add(world, car);

        var constraint = Constraint.create({
            bodyA: car,
            bodyB: glow,
            stiffness: 0,
            length: 0,
            pointA: { x: 0, y: 0 },
            pointB: { x: 0, y: 70 }
        });
        World.add(world, constraint);
    }
    else if (obj.type === 'wall') {
        const wall = Bodies.rectangle(obj.x, obj.y, obj.width, obj.height, {
            isStatic: true,
            render: {
                fillStyle: '#fff',
            }
        });
        World.add(world, wall);
    }
    else if (obj.type === 'road') {
        const road = Bodies.rectangle(obj.x, obj.y, obj.width, obj.height, {
            isStatic: true,
            isSensor: true,
            render: {
                sprite: {
                    texture: obj.path,
                    // xScale: obj.width / 100,
                    // yScale: obj.height / 50,
                },
                fillStyle: null,
                opacity: obj.opacity
            }
        });
        road.id = obj.id;
        World.add(world, road);
    }
    else if (obj.type === 'light') {
        console.log(`/static/assets/${obj.color}_light.png`);
        
        let light = Bodies.rectangle(obj.x, obj.y, obj.width, obj.height, {
            isStatic: true,
            isSensor: true,
            render: {
                sprite: {
                    texture: `/static/assets/${obj.color}_light.png`,
                    // xScale: obj.width / 100,
                    // yScale: obj.height / 50,
                },
                fillStyle: null,
                opacity: obj.opacity
            }
        });
        light.id = obj.id;
        Body.setAngle(light, obj.rotate);
        World.add(world, light);
    }
}


let speed = 0;
let wheelAngle = 0;

// Константы
const maxWheelAngle = Math.PI / 6; // (30 градусов)
const maxSpeed = 10;
const acceleration = 0.05;
const deceleration = 0.05;
const breakDeceleration = 0.08;
const wheelRotateSpeed = 0.06;

Events.on(engine, 'beforeUpdate', () => {
    if (car === null) return;

    const velocity = Body.getVelocity(car);
    const currentSpeedX = velocity.x;
    const currentSpeedY = velocity.y;

    // Направление машины (угол)
    const angle = car.angle;

    // Вектор направления машины: косинус и синус угла
    const directionX = Math.sin(angle);
    const directionY = -Math.cos(angle);

    // Скалярное произведение скорости и направления
    speed = (currentSpeedX * directionX + currentSpeedY * directionY);

    if (window.carControl) {
        let opacity = window.carControl.engine_started;
        let step = .01;
        let iId = setInterval(() => {
            if (opacity > glow.render.opacity && Math.abs(opacity - glow.render.opacity) > step) {
                glow.render.opacity += step;
            }
            else if (opacity < glow.render.opacity && Math.abs(opacity - glow.render.opacity) > step) {
                glow.render.opacity -= step;
            }
            else if ((opacity - glow.render.opacity) < step) {
                clearInterval(iId);
            }
            console.log(glow.render.opacity);
            
        }, 50);

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

        // brakes
        if (window.carControl.brakes) {
            if (Math.abs(speed) < breakDeceleration) speed = 0;
            else if (speed > 0) speed -= breakDeceleration;
            else if (speed < 0) speed += breakDeceleration;
        }

        if (wheelAngle < window.carControl.wheel_angle) {
            wheelAngle = Math.min(wheelAngle + wheelRotateSpeed, maxWheelAngle);
        } else if (wheelAngle > window.carControl.wheel_angle) {
            wheelAngle = Math.max(wheelAngle - wheelRotateSpeed, -maxWheelAngle);
        } else {
            wheelAngle *= 0.9;
        }
    }

    const turnRadius = car.width / Math.tan(wheelAngle);

    if (Math.abs(wheelAngle) > 0.01) {
        const angularVelocity = speed / turnRadius; // Угловая скорость
        console.log(car);
        Body.setAngularVelocity(car, angularVelocity);
    } else {
        // Прямолинейное движение
        Body.setAngularVelocity(car, 0); 
    }

    const velocityX = Math.sin(angle) * speed;
    const velocityY = -Math.cos(angle) * speed;
    Body.setVelocity(car, { x: velocityX, y: velocityY });

    if (!fixedCamera) {
        const { x, y } = car.position;
        Render.lookAt(render, {
            min: { x: x - width / 2, y: y - height / 2 },
            max: { x: x + width / 2, y: y + height / 2 },
        });
    }

    if (typeof lightControl !== 'undefined') {
        getBodyById(lightControl.id).render.sprite.texture = `/static/assets/${lightControl.str_color}_light.png`;
    }
});

function levelEnd() {
    document.getElementById('nextLevelButton').hidden = false;
}

document.getElementById('nextLevelButton').addEventListener('click', () => {
    window.location.href = `/${levelId + 1}`;
});

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

function addMessage(message, type='text', onclick=null, autodelete=null, newBlock=false) {
    let messagesBlock = document.querySelector('.messages');

    if (type === 'button' && autodelete === null) {
        autodelete = true;
    }

    let newMsg = null;
    if (type === 'text') {
        newMsg = document.createElement('p')
        newMsg.innerHTML = message;

        if (newBlock) newMsg.style.marginTop = '10px';

        messagesBlock.appendChild(newMsg);
    
        smoothScrollTo(messagesBlock, messagesBlock.scrollHeight - messagesBlock.clientHeight - 30, 1000);
    }
    else if (type === 'button') {
        newMsg = document.createElement('button');
        newMsg.innerText = message;
        newMsg.className = 'chatButton';
        if (!autodelete) newMsg.addEventListener('click', onclick);
        else newMsg.addEventListener('click', () => {
            onclick();
            newMsg.remove();
        });
        messagesBlock.appendChild(newMsg);
    
        smoothScrollTo(messagesBlock, messagesBlock.scrollHeight - messagesBlock.clientHeight, 1000);
    }
}

function getBodyById(id) {
    return Composite.allBodies(world).find(body => body.id === id);
}