#!/usr/bin/env python3
import logging
import os
import sys

from orangeshare.__main__ import start_in_tray

if not sys.platform == "win32":
    print("Tray icon is currently only supported on windows")
    print("For the Gnome desktop environment take a look at this: https://github.com/Yannis4444/Orange-Share#gnome-shell-extension")

if __name__ == '__main__':
    # set logging level
    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] %(levelname)-8s %(name)-12s %(message)s',
    )

    os.chdir(os.path.join(os.path.abspath(os.path.dirname(__file__)), "orangeshare"))

    start_in_tray()
