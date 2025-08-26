from flask import Flask, render_template, request, jsonify
import mysql.connector

app = Flask(__name__)

def connect_db():
    return mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="admin",   # adapte si besoin
        database="olympiade",
        port=3306
    )

@app.route("/")
def home():
    return render_template("index.html")

# Enregistrer un utilisateur
@app.route("/api/start", methods=["POST"])
def start_game():
    data = request.json
    nom = data["nom"]

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO user_game (nom) VALUES (%s)", (nom,))
    conn.commit()
    user_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return jsonify({"user_id": user_id, "nom": nom})

# Récupérer les questions d’une table (ex: question1, question2, question3)
@app.route("/api/questions/<table_name>")
def get_questions(table_name):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute(f"SELECT idquestion, question, option_a, option_b, option_c, correct FROM {table_name}")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    questions = []
    for q in rows:
        questions.append({
            "id": q[0],
            "question": q[1],
            "options": [f"a) {q[2]}", f"b) {q[3]}", f"c) {q[4]}"],
            "answer": q[5]   # "a", "b" ou "c"
        })
    return jsonify(questions)

# Enregistrer un score
@app.route("/api/score", methods=["POST"])
def save_score():
    data = request.json
    user_id = data["user_id"]
    score = data["score"]

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO score (valeur_score, iduser) VALUES (%s, %s)", (score, user_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"status": "ok", "score": score})

if __name__ == "__main__":
    app.run(debug=True)
