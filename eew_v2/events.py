
from typing import Type
from template import Source, SourceItem, Event


def integrate_source(source: Type[Source], timeout: int) -> tuple[list[Event], bool]:
    # 从源中获取数据
    res, err = source.fetch(timeout)
    if err:
        return [], err

    # 从源中分割数据
    data, err = source.parse(res)
    if err:
        return [], err

    # 格式化数据至事件列表
    return source.format(data), False


def list_sources(sources: list[Type[Source]]) -> list[SourceItem]:
    result: list[SourceItem] = []
    for i in sources:
        # 得到数据源名称和值
        name, value = i.property()
        result.append({
            "name": name,
            "value": value
        })

    return result
