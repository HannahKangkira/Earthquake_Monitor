from typing import Type, TypedDict


class Event(TypedDict):
    time: int
    place: str
    region: str
    depth: float
    latitude: float
    longitude: float
    magnitude: float


class Source:
    def property(self) -> tuple[str, str]:
        return "", ""

    def fetch(self, timeout: int) -> tuple[str, bool]:
        return str(timeout), False

    def parse(self, response: str) -> tuple[list, bool]:
        return [response], False

    def format(self, raw_data: list) -> list[Event]:
        raw_data
        return []


class SourceItem:
    name: str
    source: Type[Source]


class RouterItem:
    path: str
    method: [str]
    handler: callable
