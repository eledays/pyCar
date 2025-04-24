from app import app
from app.CodeExec import execute_code
from app.GameObjects import Car

from flask import request, jsonify, render_template, redirect, url_for
import os
import threading


@app.route('/')
@app.route('/main')
def main():
    return redirect(url_for('sandbox'))


@app.route('/sandbox')
def sandbox():
    return render_template('levels/1000.html')


@app.route('/<int:level_id>')
def level(level_id):
    levels = sorted([int(e.rstrip('.html')) for e in os.listdir('app/templates/levels')])
    if level_id in levels:
        return render_template(f'levels/{level_id}.html')
    else:
        return redirect('/')


@app.route('/execute_code', methods=['POST'])
def handle_execute_code():
    code = request.json.get('code', '')
    
    car = Car()
    game_objects = {'car': car}
    from time import sleep

    r = execute_code(code, {'car': car, 'game_objects': game_objects, 'sleep': sleep})
    return jsonify(r)
