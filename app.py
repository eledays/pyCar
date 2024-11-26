from flask import Flask, request, jsonify, render_template
import sys
from io import StringIO
import json
import game_objects


app = Flask(__name__)
car = game_objects.Car()
DEFAULT_VARS = {'car': car}
REQUIRED_CAR_ARGS = ['engine_started', 'power', 'wheel_angle']


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/exec', methods=['POST'])
def exec_code():
    r = request.get_json()
    
    code = r.get('code')
    vars = dict(r.get('vars')) if r.get('vars') else DEFAULT_VARS

    try:
        exec(code, vars)
    except Exception as e:
        return jsonify({
            'error': str(e)
        })

    user_vars = {}
    for k, v in vars.items():
        if k.startswith('__') or str(v).startswith('<class'):
            continue
        if k == 'car' and isinstance(v, game_objects.Car):
            v = v.to_dict()
            print(v)

            if 'error' in v and v['error']:
                return jsonify({'error': v['error']})
            
            for arg in REQUIRED_CAR_ARGS:
                if arg not in v:
                    return jsonify({'error': f'У объекта {k} отсуствует обязательный атрибут {arg}'})

            user_vars[k] = v
        else:
            user_vars[k] = str(v)

    return jsonify(user_vars)


if __name__ == '__main__':
    app.run(debug=True)
