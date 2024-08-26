
from typing import Type
from template import Source, SourceItem, Event


def integrate_source(source: Type[Source], timeout: int) -> tuple[list[Event], bool]:
    # Fetch data from source
    res, err = source.fetch(timeout)
    if err:
        [], err

    # Parse data from source
    data, err = source.parse(res)
    if err:
        [], err

    # Format data to Event list
    return source.format(data), False


def list_sources(sources: list[Type[Source]]) -> list[SourceItem]:
    result: list[SourceItem] = []
    for i in sources:
        # Get source name and value
        name, value = i.property()
        result.append({
            "name": name,
            "value": value
        })

    return result
