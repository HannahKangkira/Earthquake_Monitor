from template import Event, Source


class CWB(Source):
    def property(self) -> tuple[str, str]:
        return "台湾交通部中央氣象局", "CWB"

    def fetch(self, timeout: int) -> tuple[str, bool]:
        return str(timeout), False

    def parse(self, response: str) -> tuple[list, bool]:
        return [response], False

    def format(self, raw_data: list) -> list[Event]:
        raw_data
        return []
