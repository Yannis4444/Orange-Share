import pyperclip

from orangeshare import Config
from orangeshare.notify import notify


def handle_file(file: str, file_name: str):
    """
    Copies the file to clipboard by saving it to a temporary directory and then copying it

    :param file: The file
    :param file_name: The filename
    :return: response for the request
    """

    print(file, file_name)

    # config = Config.get_config()
    # if config.config.getboolean("CLIPBOARD", "notification", fallback=True):
    #     notify("Copied File to clipboard: \"{}\"".format(filename))

    # return {"success": True}
    return {"message": "Copying file to clipboard is not yet implemented"}


def handle_text(text: str, *args):
    """
    Copies the given text to the clipboard

    :param text: The text
    :return: response for the request
    """

    pyperclip.copy(text)

    config = Config.get_config()
    if config.config.getboolean("CLIPBOARD", "notification", fallback=True):
        if config.config.getboolean("CLIPBOARD", "notification_content", fallback=True):
            notify("Copied Text to clipboard:\n" + text)
        else:
            notify("Copied Text to clipboard")

    return {'success': True}
