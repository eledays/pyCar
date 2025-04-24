# Импорты библиотек
from app.GameObjects import to_json

import multiprocessing
import json
import io
import sys
import traceback
import threading
import time
from copy import deepcopy


# Функция исполнения кода
def execute_code(code, globals, locals={}):
    # Функция исполнения кода, которая будет запущена в отдельном процессе для изоляции
    def code_run(globals, locals):
        global do_check, output_capture, error
        try:
            # Перенаправляем вывод кода в переменную
            output_capture = io.StringIO()
            sys.stdout = output_capture

            # Исполняем код
            exec(code, globals, locals)

        except Exception as e:
            # обрабатываем ошибку
            error = traceback.format_exc()

        finally:
            do_check = False
            sys.stdout = sys.__stdout__

    # Создание и запуск потока для исполнения кода
    code_run_thread = threading.Thread(target=code_run, args=(globals, locals))
    code_run_thread.start()

    global do_check, output_capture, error

    do_check = True
    last_state = None
    error = None
    start_time = time.time()

    # Превышение максимально допустимого времени исполнения (2 минуты) - ошибка
    if time.time() - start_time >= 120:
        do_check = False
        sys.stdout = sys.__stdout__
        return {'error': 'Time error', 'game_objects': last_state}

    # Если изменились игровые объекты, отправляем информацию об этом
    if last_state != to_json(globals['game_objects']):
        last_state = to_json(globals['game_objects'])
        r = {
            'ok': error is None,
            'game_objects': to_json(globals['game_objects']),
            'output': output_capture.getvalue(),
            'error': error
        }
        output_capture = io.StringIO()
        sys.stdout = output_capture

    return r
