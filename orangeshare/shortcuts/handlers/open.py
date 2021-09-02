import os
from typing import Optional

import validators

from orangeshare import Config
from orangeshare.notify import notify
from orangeshare.shortcuts.handlers.open_helper import open_url, open_text, open_file
from orangeshare.temp_dir import temp_dir


def handle_file(file, filename: str):
    """
    Copies the file to clipboard by saving it to a temporary directory and then copying it

    :param file: The file
    :param filename: The filename
    :return: response for the request
    """

    config = Config.get_config()
    if config.config.getboolean("OPEN", "notification", fallback=True):
        notify("Opening File \"{}\"".format(filename))

    path = os.path.join(temp_dir.name, filename)
    file.save(path)
    open_file(path)

    return {'success': True}


def handle_text(text: str, filename: str, file_extension: Optional[str] = None):
    """
    Copies the given text to the clipboard

    :param text: The text
    :param file_extension: The filename
    :param file_extension: The extension of the file
    :return:
    """

    config = Config.get_config()

    if validators.url(text):
        if config.config.getboolean("OPEN", "notification", fallback=True):
            notify("Opening URL \"{}\"".format(text))
        return open_url(text)
    else:
        # Firefox pages are weird...
        text_split = text.split("\n")
        if len(text_split) == 2 and validators.url(text_split[1]):
            if config.config.getboolean("OPEN", "notification", fallback=True):
                notify("Opening URL \"{}\"".format(text))
            return open_url(text_split[1])

    if config.config.getboolean("OPEN", "notification", fallback=True):
        notify("Opening File \"{}.{}\"".format(filename, file_extension))
    open_text(text, "{}.{}".format(filename, file_extension))

    return {'success': True}
