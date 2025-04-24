from flask import Flask
app = Flask(__name__)

from app.GameObjects import Car, Color, Light

RED = Color(0)
YELLOW = Color(1)
GREEN = Color(2)

car = Car()
light = Light(2, GREEN)

gameObjects = {
    'car': car,
    'light': light
}

from app import routes, CodeExec