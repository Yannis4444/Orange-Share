import argparse
import logging
import os
import sys
import threading
from typing import Optional

from orangeshare import Orangeshare


def get_args() -> argparse.Namespace:
    """
    Gets all commandline arguments and validates them.

    :return: The arguments
    """

    parser = argparse.ArgumentParser(description='A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS')
    parser.add_argument('--version', required=False, action='count', default=0, help="Print the Version")
    parser.add_argument('-p', '--api-port', required=False, type=int, help="Port number of the api server (default: 7615)", metavar="<port>", default=7615)
    parser.add_argument('-u', '--ui-port', required=False, type=int, help="Port number of the UI server (default: 7616)", metavar="<port>", default=7616)
    parser.add_argument('-o', '--open-ui', required=False, action='count', help="Open the server controls in the browser")
    if sys.platform == "win32":
        parser.add_argument('-t', '--tray-icon', required=False, action='count', help="Run with tray icon")
    parser.add_argument('-v', '--verbose', required=False, action='count', default=0, help="Enable verbose output")

    args = parser.parse_args()

    if args.version:
        from orangeshare import __version__
        print(__version__)
        exit(0)

    return args


orangeshare: Optional[Orangeshare] = None


def start_in_tray(api_port: int = 7615, ui_port: int = 7616, open_ui: bool = False):
    """
    Creates a tray icon and starts and stops Orange Share from its actions

    :param api_port: The port to run the API on
    :param ui_port: The port to run the UI on
    :param open_ui: If the UI should be opened each time
    """

    from pystray import Icon as icon, Menu as menu, MenuItem as item
    from PIL import Image

    image_active = Image.open(os.path.join(os.path.abspath(os.path.dirname(__file__)), "logo/white.png"))
    image_inactive = Image.open(os.path.join(os.path.abspath(os.path.dirname(__file__)), "logo/gray.png"))

    def get_start_stop_text(icon):
        return "Stop" if orangeshare else "Start"

    def start_stop(icon, item):
        global orangeshare
        if orangeshare is None:
            icon.icon = image_active
            orangeshare = Orangeshare(api_port, ui_port)
            orangeshare.run(bool(open_ui))
        else:
            orangeshare.stop()
            orangeshare = None
            icon.icon = image_inactive

    def open_settings(icon, item):
        global orangeshare
        if orangeshare is None:
            icon.icon = image_active
            orangeshare = Orangeshare(api_port, ui_port)
            orangeshare.run()

        orangeshare.open_ui()

    def exit_app(icon, item):
        global orangeshare
        if orangeshare is not None:
            orangeshare.stop()

        icon.visible = False
        icon.stop()

    icon(
        'Orange Share',
        image_inactive,
        "Orange Share",
        menu=menu(
            item(
                get_start_stop_text,
                start_stop),
            item(
                "Settings",
                open_settings),
            item(
                "Exit",
                exit_app)
        )
    ).run()


def main():
    args = get_args()

    # set logging level
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format='[%(asctime)s] %(levelname)-8s %(name)-12s %(message)s',
    )

    if sys.platform == "win32" and args.tray_icon:
        start_in_tray(args.api_port, args.ui_port, args.open_ui)
    else:
        orangeshare = Orangeshare(args.api_port, args.ui_port)
        orangeshare.run(bool(args.open_ui))


if __name__ == '__main__':
    main()
