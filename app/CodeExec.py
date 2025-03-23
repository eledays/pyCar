from app.GameObjects import to_json

import multiprocessing
import json
import io
import sys
import traceback
import threading
import time


def execute_code(code, globals):
    def run(shared_dict):
        locals = {}
        try:
            output_capture = io.StringIO()
            sys.stdout = output_capture

            shared_dict['game_objects'] = to_json(globals['game_objects'])
            shared_dict['output'] = output_capture.getvalue()

            exec(code, globals, locals)

            shared_dict['game_objects'] = to_json(globals['game_objects'])
            shared_dict['output'] = output_capture.getvalue()

        except Exception as e:
            shared_dict['error'] = traceback.format_exc()

        finally:
            sys.stdout = sys.__stdout__

    manager = multiprocessing.Manager()
    shared_dict = manager.dict()

    def run_thread():
        while True:
            if 'game_objects' in shared_dict:
                print(json.loads(shared_dict['game_objects'])['car']['engine']['started'])
            time.sleep(.1)

    thread = threading.Thread(target=run_thread)
    thread.start()

    process = multiprocessing.Process(target=run, args=(shared_dict,))
    process.start()
    process.join(timeout=120)

    if process.is_alive():
        process.terminate()
        shared_dict['error'] = 'Time error'

    print(shared_dict)

    return {
        'ok': 'error' not in shared_dict,
        'error': shared_dict.get('error', None),
        'game_objects': json.loads(shared_dict.get('game_objects', '{}')),
        'output': shared_dict.get('output', '')
    }