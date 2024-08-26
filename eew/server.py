
from logger import println
from waitress import serve
from typing import Type
from flask import Flask, request
from response import generate_response
from template import Source
from events import integrate_source, list_sources
from flask_cors import CORS


def api_events(sources: list[Type[Source]]):
    println(f"{request.remote_addr} {request.method} {request.path}")

    if request.method == "POST":
        source_name = request.form.get("source")
        if source_name is None:
            return generate_response(
                400, True, "缺少相关数据源参数", None,
            )
        for i in sources:
            _, value = i.property()
            if source_name == value:
                events, err = integrate_source(i, 10)
                if err:
                    return generate_response(
                        500, True, "取得地震资料发生错误", None,
                    )

                return generate_response(
                    200, False, "成功取得地震资料", events,
                )
        return generate_response(
            400, True, "暂时不支持此数据源", None,
        )
    elif request.method == "GET":
        return generate_response(
            200, False, "成功取得地震数据源", list_sources(sources),
        )
    else:
        return generate_response(
            405, True, "不支持的请求方法", None,
        )


def start_server(listen: str, port: int,  sources: list[Type[Source]]) -> None:
    app = Flask(__name__)
    CORS(app)

    @app.route("/api/events", methods=["GET", "POST"])
    def router_api_events():
        return api_events(sources)

    println("Server is running on http://%s:%d" % (listen, port))
    serve(app, host=listen, port=port)
