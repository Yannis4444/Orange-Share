import datetime
import logging
import os
import subprocess
import sys
import webbrowser
from typing import Optional

from orangeshare import Config
from orangeshare.notify import notify
from orangeshare.temp_dir import temp_dir


def open_url(url: str):
    """
    Opens a given URL in the browser

    :param url: The url
    """

    if url == "":
        logging.error("can't open URL: URL is empty")
        return {"message": "URL is empty"}, 400

    logging.info("opening URL \"{}\"".format(url))

    config = Config.get_config()
    if config.config.getboolean("OPEN", "notification", fallback=True):
        notify("Opening URL \"{}\"".format(url))

    webbrowser.open(url)

    return {'success': True}


def open_file(filename: str):
    """
    Opens the given file in the default application

    :param filename: The filename
    """

    if sys.platform == "win32":
        os.startfile(filename)
    else:
        opener = "open" if sys.platform == "darwin" else "xdg-open"
        subprocess.call([opener, filename], stdout=None)


def open_text(text: str, filename: Optional[str] = None):
    if not filename:
        filename = "{}.txt".format(datetime.datetime.now().isoformat())

    config = Config.get_config()
    if config.config.getboolean("OPEN", "notification", fallback=True):
        notify("Opening Text")

    path = os.path.join(temp_dir.name, filename)
    textfile = open(path, "w")
    textfile.write(text)
    textfile.close()
    open_file(path)
