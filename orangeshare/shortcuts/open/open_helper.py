import datetime
import logging
import os
import subprocess
import sys
import webbrowser

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


def open_text(text: str):
    filename = "{}.txt".format(datetime.datetime.now().isoformat())

    logging.info("opening Text")

    path = os.path.join(temp_dir.name, filename)
    textfile = open(path, "w")
    textfile.write(text)
    textfile.close()
    open_file(path)
