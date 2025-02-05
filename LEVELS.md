# Определения 

**Определяющий код** — код на Python, который выполняется при инициализации мира и определяет существующие объекты, например, в нем объявляется класс Car и объект car этого класса

**Базовый пользовательский код** — содержимое редактора кода при запуске страницы


### Строение уровня

Номер. Название (короткое, 1-2 слова)

Описание (опционально)

Определяющие код, базовый пользовательский код


# Уровни
## 1. Первое движение

#### Описание
Объяснение функций, объектов, принципа обращения к функциям объекта, простое движение

#### Определяющий код
```python
import asyncio

class Car:
    def __init__(self):
        self.power = 0
        self.engine_started = True
        self.wheel_angle = 0

        self.error = None

    def move(self):
        asyncio.create_task(self._move()) 

    async def _move(self):
        self.power = 1

car = Car()
```

#### Решение
```python
car.move()
```


## 2. Пауза

#### Описание
Использование sleep()

#### Определяющий код
```python
import asyncio

async def _process_tasks():
    while True:
        task = await task_queue.get()
        await task
        task_queue.task_done()


task_queue = asyncio.Queue()
asyncio.create_task(_process_tasks())

class Car:
    def __init__(self):
        self.power = 0
        self.engine_started = True
        self.wheel_angle = 0

    def move(self):
        task_queue.put_nowait(self._move())

    async def _move(self):
        self.power = 1

    def stop(self):
        task_queue.put_nowait(self._stop())

    async def _stop(self):
        self.power = 0

def sleep(seconds):
    task_queue.put_nowait(asyncio.sleep(seconds))

car = Car()
```

#### Пользовательский код
```python
car.move()
sleep(3)
car.stop()
```

## 3. Управление

#### Описание
Более глубокое управление автомобилем

#### Определяющий код
```python
import asyncio

async def _process_tasks():
    while True:
        task = await task_queue.get()
        await task
        task_queue.task_done()


task_queue = asyncio.Queue()
asyncio.create_task(_process_tasks())

class Car:
    def __init__(self):
        self.power = 0
        self.engine_started = False
        self.wheel_angle = 0
        self.gear = 0
        self.brakes = False

    def engine_start(self):
        task_queue.put_nowait(self._engine_start())

    async def _engine_start(self):
        self.engine_started = True

    def engine_stop(self):
        task_queue.put_nowait(self._engine_stop())

    async def _engine_stop(self):
        self.engine_started = False

    def brakes_on(self):
        task_queue.put_nowait(self._brakes_on())

    async def _brakes_on(self):
        self.brakes = True

    def brakes_off(self):
        task_queue.put_nowait(self._brakes_off())

    async def _brakes_off(self):
        self.brakes = False

    def set_power(self, *args, **kwargs):
        task_queue.put_nowait(self._set_power(*args, **kwargs))

    async def _set_power(self, value):
        self.brakes = False
        self.power = (value / 100) * self.gear * self.engine_started

    def gear_F(self):
        task_queue.put_nowait(self._gear_F())

    async def _gear_F(self):
        self.gear = 1

    def gear_R(self):
        task_queue.put_nowait(self._gear_R())

    async def _gear_R(self):
        self.gear = -1

    def gear_P(self):
        task_queue.put_nowait(self._gear_P())

    async def _gear_P(self):
        self.gear = 0

def sleep(seconds):
    task_queue.put_nowait(asyncio.sleep(seconds))

car = Car()
```

## 4. Светофор

#### Описание
Взаимодействие со светофором - условный оператор if

#### Определяющий код
```python
import asyncio

async def _process_tasks():
    while True:
        task = await task_queue.get()
        await task
        task_queue.task_done()


task_queue = asyncio.Queue()
asyncio.create_task(_process_tasks())

class Car:
    def __init__(self):
        self.power = 0
        self.engine_started = False
        self.wheel_angle = 0
        self.gear = 0
        self.brakes = False

    def engine_start(self):
        task_queue.put_nowait(self._engine_start())

    async def _engine_start(self):
        self.engine_started = True

    def engine_stop(self):
        task_queue.put_nowait(self._engine_stop())

    async def _engine_stop(self):
        self.engine_started = False

    def brakes_on(self):
        task_queue.put_nowait(self._brakes_on())

    async def _brakes_on(self):
        self.brakes = True

    def brakes_off(self):
        task_queue.put_nowait(self._brakes_off())

    async def _brakes_off(self):
        self.brakes = False

    def set_power(self, *args, **kwargs):
        task_queue.put_nowait(self._set_power(*args, **kwargs))

    async def _set_power(self, value):
        self.brakes = False
        self.power = (value / 100) * self.gear * self.engine_started

    def gear_F(self):
        task_queue.put_nowait(self._gear_F())

    async def _gear_F(self):
        self.gear = 1

    def gear_R(self):
        task_queue.put_nowait(self._gear_R())

    async def _gear_R(self):
        self.gear = -1

    def gear_P(self):
        task_queue.put_nowait(self._gear_P())

    async def _gear_P(self):
        self.gear = 0

class Light:
    RED = 0
    YELLOW = 1
    GREEN = 2
    def __init__(self, id, color):
        self.id = id
        self.color = color
        self.str_color = ['red', 'yellow', 'green'][self.color]

    def set_color(self, color):
        self.color = color
        self.str_color = ['red', 'yellow', 'green'][self.color]

    def get_color(self):
        return self.color

def sleep(seconds):
    task_queue.put_nowait(asyncio.sleep(seconds))

RED = 0
YELLOW = 1
GREEN = 2

car = Car()
light = Light(2, Light.RED)
```