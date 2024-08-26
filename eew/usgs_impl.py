from json import loads
from typing import Iterable
from datetime import datetime
from template import Event, Source
from requests import get, exceptions
from template import Event, Source


class USGS(Source):
    def property(self) -> tuple[str, str]:
        return "United States Geological Survey", "USGS"

    def fetch(self, timeout: int) -> tuple[str, bool]:
        try:
            res = get(
                timeout=timeout,
                url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
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
            ts = int(i["features"]["properties"]["time"])
            placeName = i["features"]["properties"]["place"]
            region = i["features"]["properties"]["place"]
            depth = float(i["features"]["geometry"]["coordinates"][2])
            latitude = float(i["features"]["geometry"]["coordinates"][1])
            longitude = float(i["features"]["geometry"]["coordinates"][0])
            magnitude = float(i["features"]["properties"]["mag"])

            result.append({
                "shockTime": ts,
                "placeName": placeName,
                "region": region,
                "depth": depth,
                "latitude": latitude,
                "longitude": longitude,
                "magnitude": magnitude,
            })

        return result
