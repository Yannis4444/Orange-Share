from notifypy import Notify

def notify(content, title="Orange Share", icon="logo/white.svg"):
    """
    Shows a notification.

    :param content: The content
    :param title: The titel (default: Orange Share)
    :param icon: The path to the logo (default: logo/white.svg)
    :return:
    """
    notification = Notify()
    notification.title = title
    notification.message = content
    notification.icon = icon
    notification.send(block=False)
