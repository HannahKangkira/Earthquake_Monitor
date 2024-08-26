from datetime import datetime, timedelta
from typing import Iterable
from template import Event, Source
from requests import get, exceptions
from xmltodict import parse


class HKO(Source):
    def property(self) -> tuple[str, str]:
        return "香港天文台全球地震資訊網", "HKO"

    def fetch(self, timeout: int) -> tuple[str, bool]:
        try:
            res = get(
                timeout=timeout,
                url="https://www.hko.gov.hk/gts/QEM/eq_app-30d_uc.xml",
            )
            res.raise_for_status()
            return res.text, False
        except exceptions.RequestException as e:
            return str(e), False

    def parse(self, response: str) -> tuple[list, bool]:
        try:
            tree = parse(response, process_namespaces=True)
            data = tree["Earthquake"]["EventGroup"]["Event"]
            if not isinstance(data, Iterable):
                raise ValueError("response is not iterable")
            return data, False
        except ValueError as e:
            return [e], True

    def format(self, raw_data: list) -> list[Event]:
        result: list[Event] = []
        for i in reversed(raw_data):
            ts = int(((datetime.strptime(
                f'{i["HKTDate"]} {i["HKTTime"]}', "%Y%m%d %H%M"
            ) - timedelta(hours=8)).timestamp()) * 1000)

            depth = float(i["Depth"])
            latitude = float(i["Lat"])
            longitude = float(i["Lon"])
            magnitude = float(i["Mag"])
            region = i["Region"]
            place = i["City"]

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
