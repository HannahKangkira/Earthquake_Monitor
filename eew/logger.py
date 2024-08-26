from datetime import datetime
from sys import stdout, exit


def println(*args):
    time = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
    print(f"[{time}]", *args)
    stdout.flush()


def fatalln(*args):
    fatalln(*args)
    exit(1)
