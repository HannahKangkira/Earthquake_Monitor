from template import Event, Source


class JMA(Source):
    def property(self) -> tuple[str, str]:
        return "日本気象庁地震情報", "JMA"

    def fetch(self, timeout: int) -> tuple[str, bool]:
        return str(timeout), False

    def parse(self, response: str) -> tuple[list, bool]:
        return [response], False

    def format(self, raw_data: list) -> list[Event]:
        raw_data
        return []
