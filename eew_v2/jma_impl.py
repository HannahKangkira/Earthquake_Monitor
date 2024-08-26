import re
from json import loads
from typing import Iterable
from datetime import datetime, timedelta
from template import Event, Source
from requests import get, exceptions
from template import Event, Source


class JMA(Source):
    def property(self) -> tuple[str, str]:
        return "日本気象庁地震情報", "JMA"

    def fetch(self, timeout: int) -> tuple[str, bool]:
        try:
            res = get(
                timeout=timeout,
                url="https://www.jma.go.jp/bosai/quake/data/list.json",
            )
            res.raise_for_status()
            return res.text, False
        except exceptions.RequestException as e:
            return str(e), False

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
        for i in raw_data:
            if len(i["mag"]) == 0:
                continue

            ts = int(((datetime.strptime(
                i["at"], "%Y-%m-%dT%H:%M:%S+09:00"
            ) - timedelta(hours=9)).timestamp()) * 1000)

            cord_match = re.findall(r"[+-]?\d+\.\d+", i["cod"])
            latitude = float(cord_match[0])
            longitude = float(cord_match[1])

            depth_match = re.split(r"\D+", i["cod"])
            depth = float(depth_match[len(depth_match)-2]) / 1000

            place = i["en_anm"]
            region = i["en_anm"]
            try:
                magnitude = float(i["mag"])
            except ValueError:
            # 如果无法转换为浮点数，则将magnitude设置为默认值
                magnitude = 0.0  

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
