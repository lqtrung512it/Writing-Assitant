from flask import Flask, request, jsonify, redirect,  url_for
from flask import render_template
from function import callFunctionApi
from flask_cors import CORS
from database_function import loginApi, registerApi, addHistory, viewHistory, loginGoogleApi
from authlib.integrations.flask_client import OAuth

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['GOOGLE_CLIENT_ID'] = "888511560450-gvhhtnfqo01e08tep588dqakk73bb6jc.apps.googleusercontent.com"
app.config['GOOGLE_CLIENT_SECRET'] = "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"
app.secret_key = "05122002"
oauth = OAuth(app)
CORS(app)

cors = CORS(app, resources={
    r"/*": {
        "origins": ["http://example.com", "http://localhost:3000", "http://127.0.0.1:5000", "http://127.0.0.1:5000/login/google"],
        "methods": ["GET", "POST"],
        "headers": ["Content-Type", "Authorization"]
    }
})

google = oauth.register(
    name='google',
    client_id=app.config["GOOGLE_CLIENT_ID"],
    client_secret=app.config["GOOGLE_CLIENT_SECRET"],
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid email profile'},
)


@app.route('/')
@app.route('/grammar-checker')
def grammar_checker_page():
    pathname = 'grammar-checker'
    page_name = 'Grammar Check'
    page_description = 'Welcome to NoPlag, a user-friendly web-based service that offers an advanced grammar checking tool'
    submit = 'Check'
    return render_template('function.html', page_name=page_name, title=page_name, pathname=pathname, submit=submit, page_description=page_description)


@app.route('/plagiarism-checker')
def plagiarism_checker_page():
    pathname = 'plagiarism-checker'
    page_name = 'Plagiarism Check'
    page_description = 'Ensuring originality with every click'

    submit = 'Check'
    return render_template('function.html', page_name=page_name, title=page_name, pathname=pathname, submit=submit, page_description=page_description)


@app.route('/text-completion')
def text_completion_page():
    pathname = 'text-completion'
    page_name = 'Text Completion'
    page_description = 'Improve your writing skills and create high-quality content effortlessly'
    submit = 'Complete'
    return render_template('function.html', page_name=page_name, title=page_name, pathname=pathname, submit=submit, page_description=page_description)


@app.route('/paraphraser')
def paraphraser_page():
    pathname = 'paraphraser'
    page_name = 'Paraphraser'
    page_description = 'Transform Your Language, Enhance Your Expression'
    submit = 'Paraphrase'
    return render_template('function.html', page_name=page_name, title=page_name, pathname=pathname, submit=submit, page_description=page_description)


@app.route('/translator')
def translator_page():
    pathname = 'translator'
    page_name = 'Translator'
    page_description = 'Unleashing Multilingual Potential, Connecting the World'
    submit = 'Translate'
    return render_template('function.html', page_name=page_name, title=page_name, pathname=pathname, submit=submit, page_description=page_description)


@app.route('/third-converter')
def converter_page():
    pathname = 'third-converter'
    page_name = 'Third-person Converter'
    page_description = 'Step into Their Shoes, Craft Stories Anew'
    submit = 'Convert'
    return render_template('function.html', page_name=page_name, title=page_name, pathname=pathname, submit=submit, page_description=page_description)


@app.route("/api", methods=["POST"])
def function_api():
    if request.content_type != 'application/json':
        return jsonify({'message': 'Invalid request format'})
    else:
        firstUserInput = request.json["firstUserInput"]
        currentPathname = request.json["currentPathname"]
        currentLanguage = request.json["currentLanguage"]
        login = request.json["login"]
        email = request.json["email"]
        date = request.json["date"]
        systemResponse = callFunctionApi(
            currentPathname, firstUserInput, currentLanguage)

        result = {}
        if currentPathname == 'plagiarism-checker':
            titles = []
            urls = []
            for response in jsonify(systemResponse).json['sources']:
                titles.append(jsonify(response).json['title'])
                urls.append(jsonify(response).json['url'])
            result = jsonify({
                "percentage": jsonify(systemResponse).json['percentPlagiarism'],
                "sources": [titles, urls]
            }).json
        else:
            answer = ''
            for response in systemResponse:
                answer += jsonify(response).json['text']
            result = jsonify({
                "response": answer,
            }).json
        if login == "logged":
            addHistory(date, currentPathname, firstUserInput, result, email)

        output = jsonify({"systemResponse": systemResponse})
        return output


@ app.route('/login')
def login_page():
    pathname = 'login'
    page_name = 'NoPlag'
    return render_template('auth-user.html', page_name=page_name, title=page_name, pathname=pathname)


@ app.route('/register')
def register_page():
    pathname = 'register'
    page_name = 'NoPlag'
    return render_template('auth-user.html', page_name=page_name, title=page_name, pathname=pathname)


@app.route('/login/google')
def google_login():
    google = oauth.create_client('google')
    redirect_uri = url_for('google_authorize', _external=True)
    return google.authorize_redirect('/login/google/authorize')


@app.route('/login/google/authorize')
def google_authorize():
    try:
        google = oauth.create_client('google')
        token = google.authorize_access_token()
        user_info = google.get('userinfo').json()
        u_email = user_info['email']
        [status, message] = loginGoogleApi(u_email)

        return jsonify({"status": status, "message": message})

    except Exception as error:
        print(error)
        return jsonify({"status": "fail", "message": "Authorization failed"})


@ app.route("/auth", methods=["POST"])
def auth_api():
    if request.content_type != 'application/json':
        return jsonify({'message': 'Invalid request format'})
    else:
        currentPathname = request.json["currentPathname"]
        email = request.json["email"]
        password = request.json["password"]
        if (currentPathname == "login"):
            [status, message] = loginApi(email, password)
        else:
            [status, message] = registerApi(email, password)
        return jsonify({"status": status, "message": message})


@ app.route('/history')
def history_page():
    pathname = 'history',
    page_name = "History"
    return render_template('history.html', page_name=page_name, title=page_name, pathname=pathname)


@app.route("/api/history", methods=["GET"])
def get_history():
    email = request.args.get("email")
    selectedType = request.args.get("type")

    history = viewHistory(email, selectedType)

    return jsonify(history)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
