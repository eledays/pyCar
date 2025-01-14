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
    window.innerWidth / 2, window.innerHeight / 2, 40, 80, 
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
// road.width = road.bounds.max.x - road.bounds.min.x;
// road.height = road.bounds.max.y - road.bounds.min.y;
console.log(road);

World.add(world, road);

var mainCar = Bodies.rectangle(
    -80, window.innerHeight / 2 + 80, 40, 80, 
    {
        friction: 0.02, // Трение
        render: {
            sprite: {
                texture: '/static/assets/car.png', 
                xScale: 80 / 100,
                yScale: 40 / 50,
            },
            angle: Math.PI / 2,
            fillStyle: null
        },
    }
);
mainCar.width = mainCar.bounds.max.x - mainCar.bounds.min.x;
mainCar.height = mainCar.bounds.max.y - mainCar.bounds.min.y;
World.add(world, mainCar);
Body.setAngle(mainCar, Math.PI / 2);

var params = {
    friction: 0.02, // Трение
    render: {
        sprite: {
            texture: '/static/assets/car.png', 
            xScale: 80 / 100,
            yScale: 40 / 50,
        },
        angle: Math.PI / 2,
        fillStyle: null
    },
};
var rightCars = [
    Bodies.rectangle(
        680, window.innerHeight / 2 - 80, 40, 80, params
    ),
    Bodies.rectangle(
        1280, window.innerHeight / 2 - 80, 40, 80, params
    ),
];

params = {
    friction: 0.02, // Трение
    render: {
        sprite: {
            texture: '/static/assets/car.png', 
            xScale: 80 / 100,
            yScale: 40 / 50,
        },
        angle: -Math.PI / 2,
        fillStyle: null
    },
};
var leftCars = [
    Bodies.rectangle(
        window.innerWidth, window.innerHeight / 2 + 80, 40, 80, params
    ),
    Bodies.rectangle(
        window.innerWidth + 600, window.innerHeight / 2 + 80, 40, 80, params
    ),
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

// Константы
const maxWheelAngle = Math.PI / 6; // (30 градусов)
const maxSpeed = 10;
const acceleration = 0.05;
const deceleration = 0.05;
const wheelRotateSpeed = 0.06;

Events.on(engine, 'beforeUpdate', () => {
    if (mainCar === null) return;

    Body.setVelocity(mainCar, {x: 5, y: 0});
    rightCars.forEach((e) => {
        Body.setVelocity(e, {x: 5, y: 0});
    });
    leftCars.forEach((e) => {
        Body.setVelocity(e, {x: 5, y: 0});
    });

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
