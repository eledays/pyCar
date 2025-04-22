const { Engine, Render, Runner, World, Bodies, Body, Events, Constraint, Composite } = Matter;

const width = window.innerWidth / 2;
const height = window.innerHeight;

const engine = Engine.create();
engine.world.gravity.y = 0;
const world = engine.world;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width,
        height,
        wireframes: false, 
        background: '#000'
    },
});
Render.run(render);
Runner.run(Runner.create(), engine);

var car = null;
var glow = null;
let mainLight = null;
var speed = 0;
var wheelAngle = 0;
var cameraZoom = 1;
var cameraDeltaX = 0;
var cameraDeltaY = 0;

addEventListener('wheel', (event) => {
    cameraZoom += event.deltaY / 500;
    cameraZoom = Math.max(cameraZoom, 0.5);
    cameraZoom = Math.min(cameraZoom, 5);
});

addEventListener('mousemove', (event) => {
    if (event.buttons !== 1) return;
    if (event.clientX > window.innerWidth / 2) return;

    cameraDeltaX += (event.movementX / -1) * (cameraZoom / 1);
    cameraDeltaY += (event.movementY / -1) * (cameraZoom / 1);

    cameraDeltaX = Math.max(cameraDeltaX, -850);
    cameraDeltaY = Math.max(cameraDeltaY, -1130);

    cameraDeltaX = Math.min(cameraDeltaX, 2823);
    cameraDeltaY = Math.min(cameraDeltaY, 3596);
});

helpButton.addEventListener('click', () => window.open('https://github.com/eledays/pyCar/wiki/%D0%94%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D1%8F-%D0%BF%D0%BE-%D0%BE%D0%B1%D1%8A%D0%B5%D0%BA%D1%82%D1%83-%D0%B0%D0%B2%D1%82%D0%BE%D0%BC%D0%BE%D0%B1%D0%B8%D0%BB%D1%8F', '_blank'));

function resetWorld() {
    World.clear(world);
    Engine.clear(engine);

    const map = Bodies.rectangle(mapProperties.x, mapProperties.y, mapProperties.width, mapProperties.height, {
        isSensor: true,
        render: {
            sprite: {
                texture: `/static/assets/${levelId}/${levelId}.svg`, 
            },
            fillStyle: null,
            opacity: 1
        },
    });
    World.add(world, map);

    glow = Bodies.rectangle(carProperties.x, carProperties.y - 95, carProperties.width, carProperties.height, {
        isSensor: true,
        render: {
            sprite: {
                texture: '/static/assets/glow.png', 
            },
            fillStyle: null,
            opacity: 0
        },
    });
    World.add(world, glow);

    car = Bodies.rectangle(carProperties.x, carProperties.y, carProperties.width, carProperties.height, {
        friction: 0.02, 
        render: {
            sprite: {
                texture: '/static/assets/white_car.png', 
            },
            fillStyle: null
        },
    });
    car.width = car.bounds.max.x - car.bounds.min.x;
    car.height = car.bounds.max.y - car.bounds.min.y;
    Body.setAngle(car, carProperties.rotate);
    World.add(world, car);

    var constraint = Constraint.create({
        bodyA: car,
        bodyB: glow,
        stiffness: 0,
        length: 0,
        pointA: { x: 0, y: 0 },
        pointB: { x: 0, y: 90 }
    });
    World.add(world, constraint);

    speed = 0;
    wheelAngle = 0;
}

resetWorld();

// Константы
const maxWheelAngle = Math.PI / 6;
const maxSpeed = 10;
const acceleration = 0.05;
const deceleration = 0.05;
const breakDeceleration = 0.08;
const wheelRotateSpeed = 0.06;

function updateGlow() {
    // smooth glow opacity change
    let opacity = window.carControl.engine.started * .7;
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
        
    }, 50);
}

function updateCarSpeed() {
    // engine
    if (speed + acceleration * window.carControl.engine.power * window.carControl.engine.started) {
        speed = Math.min(speed + acceleration * window.carControl.engine.power * window.carControl.engine.started, maxSpeed);
    }
    else if (window.carControl.engine.power && window.carControl.engine.power < 0) {            
        speed = Math.max(speed + acceleration * window.carControl.engine.power * window.carControl.engine.started, -maxSpeed);
    }
    else {
        if (speed > 0) speed = Math.max(speed - deceleration, 0);
        if (speed < 0) speed = Math.min(speed + deceleration, 0);
    }

    // brakes
    if (window.carControl.brakes.state) {
        if (Math.abs(speed) < breakDeceleration) speed = 0;
        else if (speed > 0) speed -= breakDeceleration;
        else if (speed < 0) speed += breakDeceleration;
    }

    // wheel rotate
    if (wheelAngle < window.carControl.steering.angle) {
        wheelAngle = Math.min(wheelAngle + wheelRotateSpeed, maxWheelAngle);
    } else if (wheelAngle > window.carControl.steering.angle) {
        wheelAngle = Math.max(wheelAngle - wheelRotateSpeed, -maxWheelAngle);
    } else {
        wheelAngle *= 0.9;
    }
}

function updateCamera() {
    const { x, y } = car.position;
    Render.lookAt(render, {
        min: { x: x - width * cameraZoom / 2 + cameraDeltaX, y: y - height * cameraZoom / 2 + cameraDeltaY },
        max: { x: x + width * cameraZoom / 2 + cameraDeltaX, y: y + height * cameraZoom / 2 + cameraDeltaY },
    });
}

Events.on(engine, 'beforeUpdate', () => {
    if (car === null) return;

    const velocity = Body.getVelocity(car);
    
    const currentSpeedX = velocity.x;
    const currentSpeedY = velocity.y;

    const angle = car.angle;

    const directionX = Math.sin(angle);
    const directionY = -Math.cos(angle);

    speed = (currentSpeedX * directionX + currentSpeedY * directionY);    

    if (window.carControl) {
        // updateGlow();
        updateCarSpeed();
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
        updateCamera();
    }

    // if (typeof lightControl !== 'undefined') {
    //     getBodyById(lightControl.id).render.sprite.texture = `/static/assets/${lightControl.str_color}_light.png`;
    // }
});

// function levelEnd() {
//     document.getElementById('nextLevelButton').hidden = false;
// }

// document.getElementById('nextLevelButton').addEventListener('click', () => {
//     window.location.href = `/${levelId + 1}`;
// });

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