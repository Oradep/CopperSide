from flask import Flask, render_template, request, jsonify, send_from_directory, abort
import json
import os
import glob
import random

app = Flask(__name__)

RULES_FILE = os.path.join(os.path.dirname(__file__), "static/data/json/rules.json")
SECRET_KEY = "zxc3228"  # Твой ключ доступа

# Путь к данным зачарований
ENCHANTS_DIR = os.path.join(os.path.dirname(__file__), "static/data/json")
ENCHANTS_FILE = os.path.join(ENCHANTS_DIR, "enchantments.json")

# Функция загрузки правил
def load_rules():
    if os.path.exists(RULES_FILE):
        with open(RULES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"categories": []}

# Функция сохранения правил
def save_rules(data):
    with open(RULES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# Главная страница
@app.route("/")
def index():
    rules = load_rules()
    return render_template("index.html", rules=rules)

@app.route("/enchants")
def enchants():
    rules = load_rules()
    return render_template("enchants.html", rules=rules)



# Страница редактирования зачарований (по ключу)
@app.route("/enchants/editor")
def enchants_editor():
    key = request.args.get("key")
    if key != SECRET_KEY:
        return "Доступ запрещен", 403
    rules = load_rules()
    return render_template("enchants-editor.html", rules=rules)

# Страница редактирования правил (по ключу)
@app.route("/editor")
def editor():
    key = request.args.get("key")
    if key != SECRET_KEY:
        return "Доступ запрещен", 403
    rules = load_rules()
    return render_template("rule-editor.html", rules=rules)

# Эндпоинт сохранения правил (POST-запрос)
@app.route("/save", methods=["POST"])
def save():
    try:
        data = request.json
        save_rules(data)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Эндпоинт для получения JSON с зачарованиями
@app.route('/static/data/json/enchantments.json')
def get_enchantments():
    if os.path.exists(ENCHANTS_FILE):
        return send_from_directory(ENCHANTS_DIR, "enchantments.json")
    else:
        return jsonify([])

# Эндпоинт для сохранения зачарований
@app.route('/save_enchants', methods=['POST'])
def save_enchants():
    try:
        data = request.json
        os.makedirs(ENCHANTS_DIR, exist_ok=True)
        with open(ENCHANTS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Новый эндпоинт для прямой ссылки на скачивание ZIP-архива из папки static/data/resourcepack
@app.route("/download_resourcepack")
def download_resourcepack():
    directory = os.path.join(app.static_folder, "data/resourcepack")
    zip_files = glob.glob(os.path.join(directory, "*.zip"))
    if not zip_files:
        abort(404, description="Ресурспак не найден на сервере, обратитесь к администратору")
    # Выбираем случайный ZIP-файл
    selected_file = os.path.basename(random.choice(zip_files))
    return send_from_directory(directory, selected_file, as_attachment=True)


# Новый эндпоинт для прямой ссылки на скачивание ZIP-архива из папки static/data/resourcepack
@app.route("/download_modpack")
def download_modpack():
    directory = os.path.join(app.static_folder, "data/modpack")
    zip_files = glob.glob(os.path.join(directory, "*.mrpack"))
    if not zip_files:
        abort(404, description="Модпак не найден на сервере, обратитесь к администратору")
    # Выбираем случайный ZIP-файл
    selected_file = os.path.basename(random.choice(zip_files))
    return send_from_directory(directory, selected_file, as_attachment=True)




@app.route("/brewery")
def brewery():
    return render_template("brewery.html")



@app.route("/brewery_full")
def brewery_full():
    key = request.args.get("key")
    if key != SECRET_KEY:
        return "Доступ запрещен", 403
    return render_template("brewery_full.html")







if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)
 