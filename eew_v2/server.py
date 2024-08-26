from logger import println
from waitress import serve
from flask import Flask
from response import generate_response
from template import RouterItem
from flask_cors import CORS


def start_server(listen: str, port: int, routers: list[RouterItem]) -> None:
    app = Flask(__name__)
    CORS(app=app, supports_credentials=True)
    println("Server is running on http://%s:%d" % (listen, port))

    for i in routers:
        app.add_url_rule(i["path"], methods=i["method"], view_func=i["handler"])

    app.register_error_handler(
        404, lambda e: (generate_response(404, True, str(e), None))
    )
    serve(app, host=listen, port=port)
