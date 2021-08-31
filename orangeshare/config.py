import logging
import socket
from typing import Optional

from appdirs import *
import configparser


class Config:
    _instance = None

    @staticmethod
    def get_config() -> 'Config':
        """
        Get the config (singleton)
        The config is loaded from file.
        If the file does not exist, default values will be set.

        :return:
        """

        if Config._instance is None:
            Config()
        return Config._instance

    def __init__(self):
        """
        Creates a new Config instance.
        Should not be called.
        Instead use get_config.
        """

        if Config._instance is not None:
            raise Exception("Config is a singleton")
        else:
            Config._instance = self

        self.directory = user_config_dir("orangeshare")
        self.file = os.path.join(self.directory, "config.ini")
        self._new_config = not os.path.isfile(self.file)

        self.config = configparser.ConfigParser()

        self._read()

        # will be set from main
        self.api_port: Optional[int] = None
        self.ui_port: Optional[int] = None

    def _read(self):
        """
        Loads the config from file.
        If the file does not exist, default values will be set.
        """

        logging.info("reading config file: {}".format(self.file))

        # get default values
        self.config.read(os.path.join(os.path.abspath(os.path.dirname(__file__)), "default.ini"))

        # get the actual values
        self.config.read(self.file)

        # set the ip and hostname if not already included
        if not self.config.get("HOST", "ip"):
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            try:
                # doesn't even have to be reachable
                s.connect(('10.255.255.255', 1))
                ip = s.getsockname()[0]
            except Exception:
                ip = '127.0.0.1'
            finally:
                s.close()

            self.config.set("HOST", "ip", ip)

        if not self.config.get("HOST", "hostname"):
            self.config.set("HOST", "hostname", socket.gethostname())

        # save the config just in case new values were added
        self.save()

    def save(self):
        """
        Saves the config to.
        """

        if not os.path.isdir(self.directory):
            os.mkdir(self.directory)

        with open(self.file, 'w') as configfile:
            self.config.write(configfile)

    @property
    def new_config(self) -> bool:
        """
        True if the config was newly created.
        This is the case when the application was run the first time.
        """

        return self._new_config
