const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

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

for (obj of objects) {
    if (obj.type === 'car') {
        car = Bodies.rectangle(obj.x, obj.y, obj.width, obj.height, {
            friction: 0.02, // Трение
            render: {
                sprite: {
                    texture: '/static/assets/car.png', 
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
}


let speed = 0;
let wheelAngle = 0;

// Константы
const maxWheelAngle = Math.PI / 6; // (30 градусов)
// const maxSpeed = 10;
const acceleration = 0.05;
const deceleration = 0.05;
const wheelRotateSpeed = 0.06;

Events.on(engine, 'beforeUpdate', () => {
    if (car === null) return;

    const velocity = Body.getVelocity(car);
    const currentSpeedX = velocity.x;
    const currentSpeedY = velocity.y;

    // Направление машины (угол)
    const angle = car.angle;

    // Вектор направления машины: косинус и синус угла
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);

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

    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    Body.setVelocity(car, { x: velocityX, y: velocityY });

    if (!fixedCamera) {
        const { x, y } = car.position;
        Render.lookAt(render, {
            min: { x: x - width / 2, y: y - height / 2 },
            max: { x: x + width / 2, y: y + height / 2 },
        });
    }
});

function levelEnd() {
    document.getElementById('nextLevelButton').hidden = false;
}

document.getElementById('nextLevelButton').addEventListener('click', () => {
    window.location.href = `/${levelId + 1}`;
});