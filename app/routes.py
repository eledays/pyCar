from app import app, socketio
from app.CodeExec import execute_code
from app.GameObjects import Car

from flask import request, jsonify, render_template, redirect, url_for
import os
import threading


@app.route('/')
@app.route('/main')
def main():
    levels = sorted([int(e.rstrip('.html')) for e in os.listdir('app/templates/levels')])

    for i, level in enumerate(levels):
        with open(f'app/templates/levels/{level}.html', 'r', encoding='utf-8') as file:
            name = file.readline().lstrip('<!-- ').rstrip(' -->\n')
            levels[i] = level, name

    return render_template('main.html', levels=levels)


@app.route('/<int:level_id>')
def level(level_id):
    levels = sorted([int(e.rstrip('.html')) for e in os.listdir('app/templates/levels')])
    if level_id in levels:
        return render_template(f'levels/{level_id}.html')
    else:
        return redirect('/')
    

@socketio.on('execute_code')
def handle_execute_code(data):
    code = data.get('code', '')

    car = Car()
    game_objects = {'car': car}
    from time import sleep

    thread = threading.Thread(target=execute_code, args=(socketio, code, {'car': car, 'game_objects': game_objects, 'sleep': sleep}))
    thread.start()
    # result = execute_code(socketio, code, {'car': car, 'game_objects': game_objects, 'sleep': sleep}, namespace='/')  # здесь из js получать объекты и формировать globals

    # socketio.emit('execution_result', result)