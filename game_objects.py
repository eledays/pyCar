import json


class Car:

    def __init__(self):
        self.power = 0
        self.engine_started = False

    def engine_start(self):
        self.engine_started = True

    def set_power(self, power: int):
        self.power = power

    def to_dict(self):
        r = {}

        for name, value in vars(self).items():
            # name = name.replace(f'_{self.__class__.__name__}__', '')
            r[name] = value

        return r