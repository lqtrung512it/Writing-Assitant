import sqlite3
import hashlib
import json
import random
import string


def generate_random_password(length=10):
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join(random.choice(letters_and_digits) for _ in range(length))


def loginGoogleApi(email):
    connection = sqlite3.connect("userdata.db")
    try:
        cur = connection.cursor()
        cur.execute("SELECT * FROM userdata WHERE email = ?", (email,))
        result = cur.fetchone()

        if result is None:
            password = generate_random_password()
            cur.execute("INSERT INTO userdata (email, password) VALUES (?, ?)",
                        (email, hashlib.sha256(password.encode()).hexdigest()))
            connection.commit()
            return ['success', "Login by Google successfully"]
        else:
            return ['fail', "Email already exists"]
    finally:
        if connection:
            connection.close()


def loginApi(email, password):
    connection = sqlite3.connect("userdata.db")
    try:
        cur = connection.cursor()
        cur.execute("SELECT password FROM userdata WHERE email = ?", (email,))
        result = cur.fetchone()
        if result is None:
            return ['fail', "This email is inactive"]
        else:
            stored_password = result[0]  # Lấy mật khẩu từ kết quả truy vấn
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            if hashed_password == stored_password:
                return ['success', "Login successfully"]
            else:
                return ['fail', "Incorrect password"]
    finally:
        if connection:
            connection.close()


def registerApi(email, password):
    connection = sqlite3.connect("userdata.db")
    try:
        cur = connection.cursor()
        cur.execute("SELECT email FROM userdata WHERE email = ?", (email,))
        result = cur.fetchone()
        if result is not None:
            return ['fail', "Email already exists"]
        else:
            cur.execute("INSERT INTO userdata (email, password) VALUES (?, ?)",
                        (email, hashlib.sha256(password.encode()).hexdigest()))
            connection.commit()
            return ['success', "Registered successfully"]
    finally:
        if connection:
            connection.close()


def addHistory(date, type, input, output, email):
    connection = sqlite3.connect("userdata.db")
    try:
        cur = connection.cursor()
        cur.execute("SELECT id FROM userdata WHERE email = ?", (email,))
        userid = cur.fetchone()[0]
        result_json = json.dumps(output)
        cur.execute("INSERT INTO historydata (date, type, input, output, userid) VALUES (?, ?, ?, ?, ?)",
                    (date, type, input, result_json, userid))
        connection.commit()
        return ['success', "History added successfully"]
    finally:
        if connection:
            connection.close()


def viewHistory(email, selectedType):
    connection = sqlite3.connect("userdata.db")
    try:
        cur = connection.cursor()
        if selectedType == '0':
            print(selectedType)
            cur.execute(
                "SELECT * FROM historydata WHERE userid = (SELECT id FROM userdata WHERE email = ?)", (email,))
        else:
            cur.execute(
                "SELECT * FROM historydata WHERE userid = (SELECT id FROM userdata WHERE email = ?) AND type = ?", (email, selectedType))
        result = cur.fetchall()
        history = []
        for row in result:
            history.append({
                'id': row[0],
                'date': row[1],
                'type': row[2],
                'input': row[3],
                'output': row[4],
                'userid': row[5]
            })
        return history
    finally:
        if connection:
            connection.close()
