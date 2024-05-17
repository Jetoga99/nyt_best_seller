from flask import Flask, render_template, jsonify, request
import requests
from datetime import datetime, timedelta

app = Flask(__name__)
API_KEY = 'NwIgb4AQ69GadFIEIdvNu52qoEinBe0y'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/listas')
def obtener_listas_best_sellers():
    url = f"https://api.nytimes.com/svc/books/v3/lists/names.json?api-key={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        return jsonify(response.json()['results'])
    else:
        return jsonify({'error': 'No se pudieron obtener las listas de Best Sellers.'}), 500

@app.route('/libros', methods=['GET'])
def obtener_libros_best_sellers():
    lista = request.args.get('lista')
    fecha = request.args.get('fecha')
    url = f"https://api.nytimes.com/svc/books/v3/lists/{fecha}/{lista}.json?api-key={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        return jsonify(response.json()['results']['books'])
    else:
        return jsonify({'error': 'No se pudieron obtener los libros de la lista seleccionada.'}), 500

@app.route('/fechas', methods=['GET'])
def obtener_fechas():
    oldest_date = request.args.get('oldest_date')
    newest_date = request.args.get('newest_date')
    updated = request.args.get('updated')
    
    start_date = datetime.strptime(oldest_date, "%Y-%m-%d")
    end_date = datetime.strptime(newest_date, "%Y-%m-%d")
    
    if updated == 'WEEKLY':
        delta = timedelta(weeks=1)
    elif updated == 'MONTHLY':
        delta = timedelta(days=30)
    else:
        return jsonify({'error': 'Intervalo de actualización no soportado.'}), 500
    
    dates = []
    while start_date <= end_date:
        dates.append(start_date.strftime("%Y-%m-%d"))
        start_date += delta

    return jsonify(dates)

if __name__ == '__main__':
    app.run(debug=True)
