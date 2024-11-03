var config = {
    type: Phaser.AUTO,
    width: window.innerWidth / 2,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('car', '/static/assets/car.png');
}

function create ()
{
    car = this.physics.add.image(400, 300, 'car');
    car.setCollideWorldBounds(true);
}

function update ()
{
    if (window.mainCar) {
        // console.log(window.mainCar);
        // console.log(car);
        
        car.setVelocityY(-window.mainCar.power * window.mainCar.engine_started);
    }
}
