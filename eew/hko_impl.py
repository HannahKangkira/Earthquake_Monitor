from template import Event, Source


class HKO(Source):
    def property(self) -> tuple[str, str]:
        return "香港天文台全球地震資訊網", "HKO"

    def fetch(self, timeout: int) -> tuple[str, bool]:
        return str(timeout), False

    def parse(self, response: str) -> tuple[list, bool]:
        return [response], False

    def format(self, raw_data: list) -> list[Event]:
        raw_data
        return []
