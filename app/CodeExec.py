from app.GameObjects import to_json

import multiprocessing


def execute_code(code, globals):
    def run(shared_dict):
        locals = {}
        try:
            exec(code, globals, locals)
            shared_dict['game_objects'] = to_json(globals['game_objects'])
        except Exception as e:
            shared_dict['error'] = str(e)

    manager = multiprocessing.Manager()
    shared_dict = manager.dict()

    process = multiprocessing.Process(target=run, args=(shared_dict,))
    process.start()
    process.join(timeout=120)

    if process.is_alive():
        process.terminate()
        shared_dict['error'] = 'Time error'

    return {
        'ok': 'error' not in shared_dict,
        'error': shared_dict.get('error', None),
        'game_objects': shared_dict.get('game_objects', None)
    }