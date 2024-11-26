import math


class Car:

    def __init__(self):
        self.power = 0
        self.engine_started = False
        self.wheel_angle = 0

        self.error = None

    def engine_start(self):
        self.engine_started = True

    def set_power(self, power: int):
        if abs(power) <= 1:
            self.power = power
        else:
            self.error = 'Мощность должна быть в диапазоне от -1 до 1'
            
    def rotate(self, deg):
        if abs(deg) <= 30:
            self.wheel_angle = deg * math.pi / 180
        else:
            self.error = 'Угол поворота должен быть в диапазоне от -30 до 30 градусов'

    def to_dict(self):
        r = {}

        if self.error:
            r = {'error': self.error}
            self.error = None
            return r

        for name, value in vars(self).items():
            # name = name.replace(f'_{self.__class__.__name__}__', '')
            r[name] = value

        return r