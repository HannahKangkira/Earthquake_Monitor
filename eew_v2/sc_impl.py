from json import loads
from typing import Iterable
from template import Event, Source
from requests import get, exceptions


class SCQR(Source):
    def property(self) -> tuple[str, str]:
        return "四川速报", "SCQR"

    def fetch(self, timeout: int) -> tuple[str, bool]:
        try:
            res = get(
                timeout=timeout,
                url="http://118.113.105.29:8002/api/bulletin/jsonPageList?pageSize=1640",
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
        for i in raw_data["data"]:
            ts = int(i["shockTime"])
            place = i["placeName"]
            region = i["placeName"]
            depth = 0
            latitude = float(i["latitude"])
            longitude = float(i["longitude"])
            magnitude = float(i["magnitude"])

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


class SCEW(Source):
    def property(self) -> tuple[str, str]:
        return "四川预警", "SCEW"

    def fetch(self, timeout: int) -> tuple[str, bool]:
        try:
            res = get(
                timeout=timeout,
                url="http://118.113.105.29:8002/api/earlywarning/jsonPageList?pageSize=860",
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
        for i in raw_data["data"]:
            ts = int(i["shockTime"])
            place = i["placeName"]
            region = i["placeName"]
            depth = 0
            latitude = float(i["latitude"])
            longitude = float(i["longitude"])
            magnitude = float(i["magnitude"])

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
