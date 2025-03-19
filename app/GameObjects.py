import json
import time
import asyncio


def to_json(game_objects):
    return json.dumps(game_objects, default=lambda o: o.__dict__)


class Engine:
    def __init__(self):
        self.started = False
        self.power = 0
    
    def start(self):
        self.started = True
        
    def stop(self):
        self.started = False
        
    def set_power(self, value):
        self.power = value / 100
        

class Headlights:
    def __init__(self):
        self.state = 0
         
    def on(self):
        self.state = 1
    
    def off(self):
        self.state = 0
        

class Steering:
    def __init__(self):
        self.angle = 0
        
    def set_angle(self, value):
        self.angle = value
        

class Brakes:
    def __init__(self):
        self.state = 0
        
    def on(self):
        self.state = 1
        
    def off(self):
        self.state = 0
    
    def set_value(self, value):
        self.value = value
        

class Gearbox:
    def __init__(self):
        self.gear = 0
        
    def D(self):
        self.gear = 1
    
    def R(self):
        self.gear = -1
    
    def P(self):
        self.gear = 0
        

class FuelSystem:
    def __init__(self):
        self.fuel = 100

    def add_fuel(self, value):
        self.fuel += value

    def get_fuel(self):
        return self.fuel
        

class Car:
    def __init__(self):
        self.engine = Engine()
        self.headlights = Headlights()
        self.steering = Steering()
        self.brakes = Brakes()
        self.gearbox = Gearbox()
        self.fuel_system = FuelSystem()


class Condition:
    def __init__(self, func):
        self.func = func

    def __call__(self):
        return self.func()

    def __bool__(self):
        return bool(self.func())

    def __str__(self):
        return str(self.func())


class Color:
    def __init__(self, value):
        self.value = value
    
    def __eq__(self, other):
        return Condition(lambda: self.value == other.value)
        
    def __ne__(self, other):
        return Condition(lambda: self.value != other.value)
    
    def __str__(self):
        return ['red', 'yellow', 'green'][self.value]


class Light:
    RED = Color(0)
    YELLOW = Color(1)
    GREEN = Color(2)
    def __init__(self, id, color):
        self.id = id
        self.color = color
        self.str_color = ['red', 'yellow', 'green'][self.color.value]

    def set_color(self, color):
        self.color = color
        self.str_color = ['red', 'yellow', 'green'][self.color.value]

    def get_color(self):
        return self.color


def wait(condition):
    while not condition():
        time.sleep(0.01)


