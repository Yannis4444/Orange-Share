from os import path

from notifypy import Notify

def notify(content, title="Orange Share"):
    """
    Shows a notification.

    :param content: The content
    :param title: The titel (default: Orange Share)
    :return:
    """
    notification = Notify()
    notification.title = title
    notification.message = content
    notification.icon = path.join(path.abspath(path.dirname(__file__)), "logo/white.svg")
    notification.send(block=False)
