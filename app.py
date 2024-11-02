from flask import Flask, request, jsonify, render_template
import sys
from io import StringIO


app = Flask(__name__)


@app.route('/')
def root():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
