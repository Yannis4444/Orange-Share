"""
Orange-Share

A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS
"""

# TODO: set to correct version (1.6.1)
__version__ = "1.4.1"
__author__ = 'Yannis Vierkoetter'

import logging
import threading
from typing import Optional

import requests
from werkzeug.serving import make_server

from flask import Flask
from flask_basicauth import BasicAuth
from flask_restful import Api

from orangeshare import devices
from orangeshare.config import Config
from orangeshare.shortcuts import File, Text
import orangeshare.ui.api.devices
import orangeshare.ui.api.host
from orangeshare.shortcuts.get_data.GetData import GetData
from orangeshare.shortcuts.handlers.open_helper import open_url

newer_version_available: Optional[bool] = None

def set_newer_version_available():
    """
    Checks if a newer Version of Orange Share is available using the github API.
    Will run the request as a Thread to avoid blocking.
    Result will be written to self.newer_version_available.
    True if a newer Version is available, False if not or the request failed
    """

    def get_version():
        global newer_version_available
        try:
            response = requests.get("https://api.github.com/repos/Yannis4444/orange-share/releases/latest")
            available_version = response.json()["tag_name"].replace("v", "").split(".")
            current_version = __version__.split(".")
            newer_version_available = current_version[0] < available_version[0] or (current_version[0] == available_version[0] and current_version[1] < available_version[1] or (current_version[0] == available_version[0] and current_version[1] == available_version[1] and current_version[2] < available_version[2]))
            if newer_version_available:
                logging.info("there is a newer version available")
        except Exception as e:
            logging.info("could not check if newer version is available: {}".format(e))

    threading.Thread(target=get_version).start()

set_newer_version_available()


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
        self.api_api.add_resource(File.File, '/api/share/file')
        self.api_api.add_resource(Text.Text, '/api/share/text')
        self.api_api.add_resource(GetData, '/api/computer_data')

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

        self.api_server: Optional[ServerThread] = None
        self.ui_server: Optional[ServerThread] = None

    def open_ui(self):
        """
        Opens the settings ui
        """

        open_url("http://localhost:{}".format(self.ui_port))

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

        # TODO: check if update available and open "whats new" and option to ignore
        # https://api.github.com/repos/Yannis4444/orange-share/releases/latest

    def stop(self):
        """
        Stop the server
        """
        self.api_server.shutdown()
        self.ui_server.shutdown()
