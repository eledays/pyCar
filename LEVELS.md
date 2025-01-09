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
sleep(1)
car.stop()
```