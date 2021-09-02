import logging
import os
from typing import Optional

import wx

from orangeshare import Config
from orangeshare.notify import notify

file_dialog_open = False


def file_dialog(directory='', filename='', extension: Optional[str] = None) -> Optional[str]:
    """
    Opens a file dialog and returns the selected file.

    :param directory: The directory to open in
    :param filename: The default file name
    :param extension: The extension without .
    :return: The selected file or None
    """

    global file_dialog_open

    if file_dialog_open:
        # can't open second time
        # TODO: reasonable solution
        return None

    file_dialog_open = True

    wildcard = None
    if extension:
        wildcard = "*." + extension

    app = wx.App(None)
    dialog = wx.FileDialog(None, 'Open', wildcard=wildcard, style=wx.FD_SAVE, defaultDir=directory, defaultFile=filename)
    if dialog.ShowModal() == wx.ID_OK:
        path = dialog.GetPath()
    else:
        path = None
    dialog.Destroy()

    file_dialog_open = False
    return path


def handle_file(file, filename: str):
    """
    Copies the file to clipboard by saving it to a temporary directory and then copying it

    :param file: The file
    :param filename: The filename
    :return: response for the request
    """

    config = Config.get_config()
    if config.config.getboolean("SAVE", "notification", fallback=True):
        notify("Saving File \"{}\"".format(filename))

    extension = filename.split(".")[-1]
    if extension == filename:
        extension = ""

    if extension:
        f = file_dialog(directory=config.config.get("SAVE", "last_location", fallback=""), filename=filename, extension=extension)
    else:
        f = file_dialog(directory=config.config.get("SAVE", "last_location", fallback=""), filename=filename)
    if not f:
        logging.error("Error while saving file: No file destination was selected")
        return {"message": "No file destination was selected"}, 500

    if not f.endswith(extension):
        f += "." + extension

    config.config.set("SAVE", "last_location", os.path.dirname(os.path.abspath(f)))
    config.save()

    logging.info("saving File \"{}\"".format(f))

    file.save(f)

    return {'success': True}


def handle_text(*args):
    return {"message": "Saving is not available for text"}, 400
