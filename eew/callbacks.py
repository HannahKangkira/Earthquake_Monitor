
from typing import Type
from flask import request
from ceic_impl import CEIC
from cwb_impl import CWB
from events import integrate_source, list_sources
from hko_impl import HKO
from logger import println
from response import generate_response
from template import Source
from usgs_impl import USGS

# Register api data source
DATA_SOURCE: list[Type[Source]] = [
    USGS(),
    HKO(),
    CWB(),
    CEIC(),
]


def callback_index():
    return generate_response(
        200, False, "欢迎使用地震数据接口", None,
    )


def callback_api_events():
    println(f"{request.remote_addr} {request.method} {request.path}")

    if request.method == "POST":
        source_name = request.form.get("source")
        if source_name is None:
            return generate_response(
                400, True, "缺少相关数据源参数", None,
            )
        for i in DATA_SOURCE:
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
            200, False, "成功取得地震数据源", list_sources(DATA_SOURCE),
        )
    else:
        return generate_response(
            405, True, "不支持的请求方法", None,
        )
