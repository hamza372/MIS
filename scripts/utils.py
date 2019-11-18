import os
import csv
import requests

import config

session = requests.Session()
session.auth = (config.username, config.password)


def get_data(module: str, debug: bool):

    # unless we are in PROD mode, this should try to read from a file first.

    if debug and os.path.exists(module + ".csv"):
        print("loading " + module + ".csv from disk")
        with open(module + ".csv") as f:
            parsed = list(csv.DictReader(f))
            return parsed

    print("downloading " + module + ".csv from API...")
    url = "https://mis-socket.metal.fish/analytics/" + module + ".csv"
    res = session.get(url)
    print("downloaded")

    decoded = res.content.decode('utf-8')
    reader = csv.DictReader(decoded.splitlines(), delimiter=",")
    parsed = list(reader)

    if debug:
        print("saving " + module + ".csv...")
        with open(module + ".csv", "w") as f:
            writer = csv.DictWriter(f, reader.fieldnames)
            writer.writeheader()
            writer.writerows(parsed)
            print("saved")

    return parsed
