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
const borders = [
    Bodies.rectangle(width / 2, 0, width, 50, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 50, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 50, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 50, height, { isStatic: true }),
];
World.add(world, borders);

// Создаём автомобиль
const carWidth = 80;
const carHeight = 40;

const car = Bodies.rectangle(400, 300, carWidth, carHeight, {
    friction: 0.02, // Трение
    render: {
        sprite: {
            texture: '/static/assets/car.png', 
            xScale: carWidth / 100,
            yScale: carHeight / 50,
        },
        fillStyle: null
    },
});
World.add(world, car);


let speed = 0;
let wheelAngle = 0;

// Константы
const maxWheelAngle = Math.PI / 6; // (30 градусов)
const maxSpeed = 10;
const acceleration = 0.05;
const deceleration = 0.05;
const wheelRotateSpeed = 0.06;

Events.on(engine, 'beforeUpdate', () => {
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
    

    if (window.mainCar) {
        if (window.mainCar.power && window.mainCar.power > 0) {
            console.log(acceleration * window.mainCar.power * window.mainCar.engine_started);

            speed = Math.min(speed + acceleration * window.mainCar.power * window.mainCar.engine_started, maxSpeed);
        }
        else if (window.mainCar.power && window.mainCar.power < 0) {
            console.log(acceleration * window.mainCar.power * window.mainCar.engine_started);
            
            speed = Math.max(speed + acceleration * window.mainCar.power * window.mainCar.engine_started, -maxSpeed);
        }
        else {
            if (speed > 0) speed = Math.max(speed - deceleration, 0);
            if (speed < 0) speed = Math.min(speed + deceleration, 0);
        }

        if (wheelAngle < window.mainCar.wheel_angle) {
            wheelAngle = Math.min(wheelAngle + wheelRotateSpeed, maxWheelAngle);
        } else if (wheelAngle < window.mainCar.wheel_angle) {
            wheelAngle = Math.max(wheelAngle - wheelRotateSpeed, -maxWheelAngle);
        } else {
            wheelAngle *= 0.9;
        }
    }

    const turnRadius = carWidth / Math.tan(wheelAngle);

    if (Math.abs(wheelAngle) > 0.01) {
        const angularVelocity = speed / turnRadius; // Угловая скорость
        Body.setAngularVelocity(car, angularVelocity);
    } else {
        // Прямолинейное движение
        Body.setAngularVelocity(car, 0); 
    }

    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    Body.setVelocity(car, { x: velocityX, y: velocityY });
});

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

document.addEventListener('keydown', (event) => {
    if (keys[event.code] !== undefined) keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    if (keys[event.code] !== undefined) keys[event.code] = false;
});
