from flask import Flask
app = Flask(__name__)

from app.GameObjects import Car
car = Car()
DEFAULT_VARS = {'car': car}
REQUIRED_CAR_ARGS = ['engine_started', 'power', 'wheel_angle']

from app import routes