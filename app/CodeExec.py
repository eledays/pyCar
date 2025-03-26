# from app import app, socketio
from app.GameObjects import to_json

import multiprocessing
import json
import io
import sys
import traceback
import threading
import time
from copy import deepcopy


def execute_code(socketio, code, globals, locals={}):
    def code_run(shared_dict, globals, locals):
        global do_check, output_capture, error
        try:
            output_capture = io.StringIO()
            sys.stdout = output_capture

            exec(code, globals, locals)

        except Exception as e:
            error = traceback.format_exc()

        finally:
            do_check = False
            sys.stdout = sys.__stdout__

    shared_dict = dict()

    code_run_thread = threading.Thread(target=code_run, args=(shared_dict, globals, locals))
    code_run_thread.start()

    global do_check, output_capture, error

    do_check = True
    last_state = None
    error = None
    start_time = time.time()

    while do_check:
        if time.time() - start_time >= 120:
            do_check = False
            sys.stdout = sys.__stdout__
            return {'error': 'Time error', 'game_objects': last_state}

        if last_state != to_json(globals['game_objects']):
            last_state = to_json(globals['game_objects'])
            socketio.emit('partial_result', {
                'ok': error is None,
                'game_objects': to_json(globals['game_objects']),
                'output': output_capture.getvalue(),
                'error': error
            })
            output_capture = io.StringIO()
            sys.stdout = output_capture

        time.sleep(.1)
