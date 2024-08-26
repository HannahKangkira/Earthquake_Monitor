from datetime import datetime
from sys import stdout, exit


def println(*args: str)-> None:
    time = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
    print(f"[{time}]", *args)
    stdout.flush()


def fatalln(*args: str) -> None:
    fatalln(*args)
    exit(1)
