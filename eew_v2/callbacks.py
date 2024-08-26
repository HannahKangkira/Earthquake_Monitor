import pymysql
from math import radians, cos, sin, asin, sqrt
from typing import Type
from flask import request
from ceic_impl import CEIC
from cwb_impl import CWB
from jma_impl import JMA
from events import integrate_source, list_sources
from hko_impl import HKO
from logger import println
from response import generate_response
from template import Source
from usgs_impl import USGS
from sc_impl import SCQR
from sc_impl import SCEW
from list import query_list

# Register api data source
DATA_SOURCE: list[Type[Source]] = [
    USGS(),
    HKO(),
    SCQR(),
    SCEW(),
    JMA(),
    CWB(),
    CEIC(),
]


def callback_index():
    return generate_response(
        200,
        False,
        "欢迎使用地震数据接口",
        None,
    )


def callback_api_events():
    println(f"{request.remote_addr} {request.method} {request.path}")

    if request.method == "POST":
        source_name = request.form.get("source")
        if source_name is None:
            return generate_response(
                400,
                True,
                "缺少相关数据源参数",
                None,
            )
        for i in DATA_SOURCE:
            _, value = i.property()
            if source_name == value:
                events, err = integrate_source(i, 10)
                if err:
                    return generate_response(
                        500,
                        True,
                        "取得地震资料发生错误",
                        None,
                    )

                return generate_response(
                    200,
                    False,
                    "成功取得地震资料",
                    events,
                )
        return generate_response(
            400,
            True,
            "暂时不支持此数据源",
            None,
        )
    elif request.method == "GET":
        return generate_response(
            200,
            False,
            "成功取得地震数据源",
            list_sources(DATA_SOURCE),
        )
    else:
        return generate_response(
            405,
            True,
            "不支持的请求方法",
            None,
        )


def geodistance(lng1, lat1, lng2, lat2):
    # lng1,lat1,lng2,lat2 = (120.12802999999997,30.28708,115.86572000000001,28.7427)
    # 经纬度转换成弧度
    lng1, lat1, lng2, lat2 = map(
        radians, [float(lng1), float(lat1), float(lng2), float(lat2)]
    )
    dlon = lng2 - lng1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    distance = 2 * asin(sqrt(a)) * 6371 * 1000  # 地球平均半径，6371km
    distance = round(distance / 1000, 3)
    return distance


def callback_api_query_shelter() -> dict:
    println(f"{request.remote_addr} {request.method} {request.path}")
    lat = request.form.get("lat")
    long = request.form.get("long")

    # 在这里可以使用 lat 和 long 进行后续处理
    # print(f"Latitude: {lat}, Longitude: {long}")
    latMax = float(lat) + 0.5
    latMin = float(lat) - 0.5
    lonMax = float(long) + 0.5
    lonMin = float(long) - 0.5
    # 连接到 MySQL 数据库
    connection = pymysql.connect(
        host="localhost",  # 数据库主机地址
        user="backend",  # 数据库用户名
        password="162534",  # 数据库密码
        db="earthquake_monitor",  # 数据库名称
    )
    result_list = []
    try:
        with connection.cursor() as cursor:
            sql_query = f"SELECT * FROM shelter WHERE Lat BETWEEN {latMin} AND {latMax} AND Lon BETWEEN {lonMin} AND {lonMax}"
            cursor.execute(sql_query)
            result = cursor.fetchall()

            for row in result:
                dist = geodistance(
                    float(lat), float(long), float(row[3]), float(row[4])
                )
                row_dict = {
                    "id": row[0],
                    "class": row[1],
                    "name": row[2],
                    "lat": row[3],
                    "lon": row[4],
                    "dist": dist,
                }
                result_list.append(row_dict)
            result_list = sorted(result_list, key=lambda x: x["dist"])
        # println(result_list)
    finally:
        # 关闭数据库连接
        connection.close()
    return generate_response(200, False, "成功取得收容点", result_list)


def callback_api_query_fault() -> dict:
    println(f"{request.remote_addr} {request.method} {request.path}")
    # 连接到 MySQL 数据库
    connection = pymysql.connect(
        host="localhost",  # 数据库主机地址
        user="backend",  # 数据库用户名
        password="162534",  # 数据库密码
        db="earthquake_monitor",  # 数据库名称
    )
    result_list = []

    try:
        for i in range(887):
            with connection.cursor() as cursor:
                sql_query = "SELECT * FROM faults WHERE line_order = " + str(i)
                cursor.execute(sql_query)
                result = cursor.fetchall()
                point_array = []
                fault_type = ""
                for row in result:
                    fault_type = row[0]
                    point_array.append(row[1])
                    point_array.append(row[2])
                row_dict = {
                    "id": i,
                    "fault_type": fault_type,
                    "point_array": point_array,
                }
                result_list.append(row_dict)
        # println(result_list)
    finally:
        # 关闭数据库连接
        connection.close()
    return generate_response(200, False, "成功取得断层线", result_list)


def callback_api_query_volcanoes() -> dict:
    println(f"{request.remote_addr} {request.method} {request.path}")

    # 连接到 MySQL 数据库
    connection = pymysql.connect(
        host="localhost",  # 数据库主机地址
        user="backend",  # 数据库用户名
        password="162534",  # 数据库密码
        db="earthquake_monitor",  # 数据库名称
    )
    result_list = []
    try:
        with connection.cursor() as cursor:
            sql_query = "SELECT * FROM volcanoes"
            cursor.execute(sql_query)
            result = cursor.fetchall()

            for row in result:
                row_dict = {
                    "vol_name": row[1],
                    "voc_reg": row[2],
                    "pri_voc_type": row[6],
                    "lat": row[3],
                    "lon": row[4],
                    "alt": row[5],
                    "voc_time": row[7],
                }
                result_list.append(row_dict)
        # println(result_list)
    finally:
        # 关闭数据库连接
        connection.close()
    return generate_response(200, False, "成功取得火山信息", result_list)


def callback_api_query_boundary() -> dict:
    println(f"{request.remote_addr} {request.method} {request.path}")
    # 连接到 MySQL 数据库
    connection = pymysql.connect(
        host="localhost",  # 数据库主机地址
        user="backend",  # 数据库用户名
        password="162534",  # 数据库密码
        db="earthquake_monitor",  # 数据库名称
    )

    result_list = []

    try:
        for item in query_list:
            with connection.cursor() as cursor:
                sql_query = 'SELECT * FROM seismicbelts WHERE border = "' + item + '"'
                cursor.execute(sql_query)
                result = cursor.fetchall()
                point_array = []
                border = ""

                for row in result:
                    border = row[1]
                    point_array.append(row[2])
                    point_array.append(row[3])
                row_dict = {"border": border, "point_array": point_array}
                result_list.append(row_dict)
        # println(result_list)
    finally:
        # 关闭数据库连接
        connection.close()
    return generate_response(200, False, "成功取得板块边界", result_list)


def callback_api_report():
    print(f"{request.remote_addr} {request.method} {request.path}")
    lat = request.form.get("lat")
    lon = request.form.get("long")
    reportQuakeLoc = request.form.get("reportQuakeLoc")
    reportQuakeTime = request.form.get("reportQuakeTime")
    feeling = request.form.get("feeling")
    print(f"{lat}{lon}{reportQuakeLoc}{reportQuakeTime}{feeling}")

    try:
        # 连接到 MySQL 数据库
        connection = pymysql.connect(
            host="localhost",  # 数据库主机地址
            user="backend",  # 数据库用户名
            password="162534",  # 数据库密码
            db="earthquake_monitor",  # 数据库名称
        )

        with connection.cursor() as cursor:
            # 构建 SQL 插入语句
            sql = f"INSERT INTO quakereport (report_name,report_time,quake_feeling,lat,lon) VALUES ('{reportQuakeLoc}',{reportQuakeTime},{feeling},{lat},{lon})"
            print(sql)
            cursor.execute(sql)
            connection.commit()
            return generate_response(200, False, "数据插入成功", {"result": "success"})

    except Exception as e:
        return generate_response(500, True, "数据插入失败", {"result": "failed"})
    finally:
        connection.close()


def callback_api_query_reports() -> dict:
    println(f"{request.remote_addr} {request.method} {request.path}")

    # 连接到 MySQL 数据库
    connection = pymysql.connect(
        host="localhost",  # 数据库主机地址
        user="backend",  # 数据库用户名
        password="162534",  # 数据库密码
        db="earthquake_monitor",  # 数据库名称
    )
    result_list = []
    try:
        with connection.cursor() as cursor:
            sql_query = "SELECT * FROM quakereport"
            cursor.execute(sql_query)
            result = cursor.fetchall()

            for row in result:
                row_dict = {
                    "name": row[0],
                    "time": row[1],
                    "feeling": row[4],
                    "lat": row[2],
                    "lon": row[3],
                }
                result_list.append(row_dict)

    finally:
        # 关闭数据库连接
        connection.close()
    return generate_response(200, False, "成功取得上报信息", result_list)
