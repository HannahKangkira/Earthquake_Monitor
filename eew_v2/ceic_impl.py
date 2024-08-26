from json import loads
from typing import Iterable
from datetime import datetime
from template import Event, Source
from requests import get, exceptions


class CEIC(Source):
    def property(self) -> tuple[str, str]:
        return "中国地震台网中心", "CEIC"

    def fetch(self, timeout: int) -> tuple[str, bool]:
        try:
            res = get(
                timeout=timeout,
                url="https://news.ceic.ac.cn/ajax/google",
            )
            res.raise_for_status()
            return res.text, False
        except exceptions.RequestException as e:
            return str(e), True

    def parse(self, response: str) -> tuple[list, bool]:
        try:
            data = loads(response)
            if not isinstance(data, Iterable):
                raise ValueError("response is not iterable")
            return data, False
        except ValueError as e:
            return [e], True

    def format(self, raw_data: list) -> list[Event]:
        result: list[Event] = []
        for i in reversed(raw_data):
            ts = int(datetime.strptime(
                i["O_TIME"], "%Y-%m-%d %H:%M:%S"
            ).timestamp()*1000)

            place = i["LOCATION_C"]
            region = i["LOCATION_C"]
            depth = float(i["EPI_DEPTH"])
            latitude = float(i["EPI_LAT"])
            longitude = float(i["EPI_LON"])
            magnitude = float(i["M"])

            result.append({
                "time": ts,
                "place": place,
                "region": region,
                "depth": depth,
                "latitude": latitude,
                "longitude": longitude,
                "magnitude": magnitude,
            })

        return result
