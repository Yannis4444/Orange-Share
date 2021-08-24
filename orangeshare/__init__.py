"""
Orange-Share

A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS
"""

__version__ = "0.2.1"
__author__ = 'Yannis Vierkoetter'

import threading

from flask import Flask
from flask_restful import Api
from orangeshare.shortcuts import *
from orangeshare.shortcuts.open.open_helper import open_url


class Orangeshare:
    """
    The Orange-Share Server
    """

    def __init__(self, port=7616):
        """
        Create a new Orange-Share instance.
        run still has to be called to start the server.

        :param port: The port to run on
        """

        self.port = port

        self.app = Flask(__name__)
        self.api = Api(self.app)

        self.api.add_resource(shortcuts.open.OpenFile, '/api/open/file')
        self.api.add_resource(shortcuts.open.OpenURL, '/api/open/url')
        self.api.add_resource(shortcuts.open.OpenText, '/api/open/text')
        self.api.add_resource(shortcuts.clipboard.ClipboardText, '/api/clipboard/text')
        self.api.add_resource(shortcuts.save.SaveFile, '/api/save/file')

        self.api.add_resource()

    def run(self, open_ui: bool = False):
        """
        Run the Orange-Share server

        :param open_ui: Open the controls in the browser once the server has started.
        """

        if open_ui:
            threading.Timer(10, open_url, args=("http://localhost:{}".format(self.port),)).start()

        self.app.run("0.0.0.0", self.port)