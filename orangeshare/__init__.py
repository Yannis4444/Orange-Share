"""
Orange-Share

A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS
"""

__version__ = "1.7.0"
__author__ = 'Yannis Vierkoetter'

import logging
import threading
from typing import Optional

from werkzeug.serving import make_server

from flask import Flask
from flask_basicauth import BasicAuth
from flask_restful import Api

from orangeshare import devices
from orangeshare.config import Config
from orangeshare.shortcuts import File, Text
import orangeshare.ui.api.devices
import orangeshare.ui.api.host
import orangeshare.ui.api.update
import orangeshare.ui.api.info
from orangeshare.shortcuts.connected import Connected
from orangeshare.shortcuts.get_data.GetData import GetData
from orangeshare.shortcuts.handlers.open_helper import open_url
from orangeshare.updater import Updater


class ServerThread(threading.Thread):
    def __init__(self, app, host, port):
        threading.Thread.__init__(self)

        self.port = port

        self.srv = make_server(host, port, app)
        self.ctx = app.app_context()
        self.ctx.push()

    def run(self):
        logging.info('starting server on port {}'.format(self.port))
        self.srv.serve_forever()

    def shutdown(self):
        logging.info('stopping server on port {}'.format(self.port))
        self.srv.shutdown()


class Orangeshare:
    """
    The Orange-Share Server
    Singleton
    """

    _instance = None

    @staticmethod
    def get_orangeshare() -> 'Orangeshare':
        """
        Get the Orange Share instance (singleton)
        Should be created using the constructor first to change parameters

        :return: The Orange Share instance
        """

        if Orangeshare._instance is None:
            Orangeshare()
        return Orangeshare._instance

    def __init__(self, api_port=7615, ui_port=7616):
        """
        Create a new Orange-Share instance.
        run still has to be called to start the server.

        :param api_port: The port to run the API on
        :param ui_port: The port to run the UI on
        """

        if Orangeshare._instance is not None:
            raise Exception("Orangeshare is a singleton")
        else:
            Orangeshare._instance = self

        # The API server
        self.api_port = api_port
        Config.get_config().api_port = api_port

        self.api_app = Flask(__name__)

        basic_auth = BasicAuth(self.api_app)
        basic_auth.check_credentials = devices.check_credentials
        self.api_app.config['BASIC_AUTH_FORCE'] = True

        self.api_api = Api(self.api_app)

        # shortcuts
        self.api_api.add_resource(File.File, '/api/share/file')
        self.api_api.add_resource(Text.Text, '/api/share/text')
        self.api_api.add_resource(GetData, '/api/computer_data')
        self.api_api.add_resource(Connected, '/api/connected')

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
        self.ui_app.add_url_rule("/update", methods=["GET"], view_func=orangeshare.ui.update)
        self.ui_app.add_url_rule("/favicon.ico", methods=["GET"], view_func=orangeshare.ui.favicon)

        # API for the UI
        self.ui_api.add_resource(orangeshare.ui.api.devices.GetDevices, '/api/devices')
        self.ui_api.add_resource(orangeshare.ui.api.devices.NewDevice, '/api/devices/new')
        self.ui_api.add_resource(orangeshare.ui.api.devices.DeleteDevice, '/api/devices/delete')
        self.ui_api.add_resource(orangeshare.ui.api.host.Host, '/api/host')
        self.ui_api.add_resource(orangeshare.ui.api.update.WindowsUpdate, '/api/update/windows')
        self.ui_api.add_resource(orangeshare.ui.api.update.PipUpdate, '/api/update/pip')
        self.ui_api.add_resource(orangeshare.ui.api.info.Version, '/api/info/version')

        self.api_server: Optional[ServerThread] = None
        self.ui_server: Optional[ServerThread] = None

    def open_ui(self, target="/"):
        """
        Opens the settings ui

        :param target: which part of the ui to open (default: "/")
        """

        open_url("http://localhost:{}{}".format(self.ui_port, target))

    def run(self, open_ui: bool = False):
        """
        Run the Orange-Share server

        :param open_ui: Open the controls in the browser once the server has started.
        """

        self.api_server = ServerThread(self.api_app, "0.0.0.0", self.api_port)
        self.api_server.start()

        self.ui_server = ServerThread(self.ui_app, "localhost", self.ui_port)
        self.ui_server.start()

        # open on first run or when specified
        if open_ui or Config.get_config().new_config:
            # threading.Timer(1, self.open_ui).start()
            self.open_ui()

        # check if update is available and maybe show popup
        Updater.get_updater().check_for_new_version(self, __version__)

    def stop(self):
        """
        Stop the server
        """
        self.api_server.shutdown()
        self.ui_server.shutdown()

    @property
    def version(self):
        """
        The Version of Orange Share

        :return: The Version
        """

        return __version__
