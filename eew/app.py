from typing import Type
from ceic_impl import CEIC
from cwb_impl import CWB
from hko_impl import HKO
from usgs_impl import USGS
from server import start_server
from template import Source


def main():
    # Register sources
    sources: list[Type[Source]] = [USGS(), HKO(), CWB(), CEIC()]
    # Start server
    start_server("127.0.0.1", 8080, sources)


if __name__ == "__main__":
    main()
