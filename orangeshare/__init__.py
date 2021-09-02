"""
Orange-Share

A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS
"""

__version__ = "1.2.4"
__author__ = 'Yannis Vierkoetter'

import threading

from flask import Flask
from flask_basicauth import BasicAuth
from flask_restful import Api

from orangeshare import devices
from orangeshare.config import Config
from orangeshare.shortcuts import File, Text
import orangeshare.ui.api.devices
import orangeshare.ui.api.host
from orangeshare.shortcuts.handlers.open_helper import open_url


class Orangeshare:
    """
    The Orange-Share Server
    """

    def __init__(self, api_port=7615, ui_port=7616):
        """
        Create a new Orange-Share instance.
        run still has to be called to start the server.

        :param api_port: The port to run the API on
        :param ui_port: The port to run the UI on
        """

        # The API server
        self.api_port = api_port
        Config.get_config().api_port = api_port

        self.api_app = Flask(__name__)

        basic_auth = BasicAuth(self.api_app)
        basic_auth.check_credentials = devices.check_credentials
        self.api_app.config['BASIC_AUTH_FORCE'] = True

        self.api_api = Api(self.api_app)

        # shortcuts
        # self.api_api.add_resource(shortcuts.open.OpenFile, '/api/open/file')
        # self.api_api.add_resource(shortcuts.open.OpenURL, '/api/open/url')
        # self.api_api.add_resource(shortcuts.open.OpenText, '/api/open/text')
        # self.api_api.add_resource(shortcuts.clipboard.ClipboardText, '/api/clipboard/text')
        # self.api_api.add_resource(shortcuts.save.SaveFile, '/api/save/file')
        self.api_api.add_resource(File.File, '/api/share/file')
        self.api_api.add_resource(Text.Text, '/api/share/text')

        # The UI Server
        self.ui_port = ui_port
        Config.get_config().ui_port = ui_port
        self.ui_app = Flask(__name__, template_folder="ui/templates", static_folder="ui/static")
        self.ui_api = Api(self.ui_app)

        # UI
        self.ui_app.add_url_rule("/", methods=["GET"], view_func=orangeshare.ui.index)
        self.ui_app.add_url_rule("/devices", methods=["GET"], view_func=orangeshare.ui.devices)
        self.ui_app.add_url_rule("/shortcuts", methods=["GET"], view_func=orangeshare.ui.shortcuts)
        self.ui_app.add_url_rule("/settings", methods=["GET"], view_func=orangeshare.ui.settings)
        self.ui_app.add_url_rule("/favicon.ico", methods=["GET"], view_func=orangeshare.ui.favicon)

        # API for the UI
        self.ui_api.add_resource(orangeshare.ui.api.devices.GetDevices, '/api/devices')
        self.ui_api.add_resource(orangeshare.ui.api.devices.NewDevice, '/api/devices/new')
        self.ui_api.add_resource(orangeshare.ui.api.devices.DeleteDevice, '/api/devices/delete')
        self.ui_api.add_resource(orangeshare.ui.api.host.Host, '/api/host')


    def run(self, open_ui: bool = False):
        """
        Run the Orange-Share server

        :param open_ui: Open the controls in the browser once the server has started.
        """

        # open on first run or when specified
        if open_ui or Config.get_config().new_config:
            threading.Timer(1, open_url, args=("http://localhost:{}".format(self.ui_port),)).start()

        threading.Thread(target=self.api_app.run, args=("0.0.0.0", self.api_port,)).start()
        self.ui_app.run("localhost", self.ui_port)
