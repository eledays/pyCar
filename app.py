from flask import Flask, request, jsonify, render_template
import sys
from io import StringIO
import os
import game_objects


app = Flask(__name__)
car = game_objects.Car()
DEFAULT_VARS = {'car': car}
REQUIRED_CAR_ARGS = ['engine_started', 'power', 'wheel_angle']


# @app.route('/')
# def root():
#     return render_template('index.html')


@app.route('/')
@app.route('/main')
def main():
    levels = sorted([int(e.rstrip('.html')) for e in os.listdir('templates/levels')])

    for i, level in enumerate(levels):
        with open(f'templates/levels/{level}.html', 'r', encoding='utf-8') as file:
            name = file.readline().lstrip('<!-- ').rstrip(' -->\n')
            levels[i] = level, name

    return render_template('main.html', levels=levels)


@app.route('/<int:level_id>')
def level(level_id):
    return render_template(f'levels/{level_id}.html')


if __name__ == '__main__':
    app.run(debug=True)
