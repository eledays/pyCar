from flask import Flask, request, jsonify
import sys
from io import StringIO

app = Flask(__name__)

@app.route('/execute', methods=['POST'])
def execute_code():
    code = request.json.get('code', '')
    old_stdout = sys.stdout
    redirected_output = sys.stdout = StringIO()
    try:
        exec(code)  # Выполнение кода
        output = redirected_output.getvalue()
        return jsonify({'output': output, 'error': None})
    except Exception as e:
        return jsonify({'output': None, 'error': str(e)})
    finally:
        sys.stdout = old_stdout

if __name__ == '__main__':
    app.run(debug=True)
