from json import loads
from typing import Iterable
from template import Event, Source
from requests import get, exceptions


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
        for i in raw_data["features"]:
            ts = int(i["properties"]["time"])
            place = i["properties"]["place"]
            region = i["properties"]["place"]
            depth = float(i["geometry"]["coordinates"][2])
            latitude = float(i["geometry"]["coordinates"][1])
            longitude = float(i["geometry"]["coordinates"][0])
            magnitude = float(i["properties"]["mag"])

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
