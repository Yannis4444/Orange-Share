import logging

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

        self._config_dir = user_config_dir("orangeshare")
        self._new_config = not os.path.isfile(os.path.join(self._config_dir, "config.ini"))

        self.config = configparser.ConfigParser()

        self._read()

    def _read(self):
        """
        Loads the config from file.
        If the file does not exist, default values will be set.
        """

        logging.info("reading config file: {}".format(os.path.join(self._config_dir, "config.ini")))

        # get default values
        self.config.read(os.path.join(os.path.abspath(os.path.dirname(__file__)), "default.ini"))

        # get the actual values
        self.config.read(os.path.join(self._config_dir, "config.ini"))

        # save the config just in case new values were added
        self.save()

    def save(self):
        """
        Saves the config to.
        """

        if not os.path.isdir(self._config_dir):
            os.mkdir(self._config_dir)

        with open(os.path.join(self._config_dir, "config.ini"), 'w') as configfile:
            self.config.write(configfile)

    @property
    def new_config(self) -> bool:
        """
        True if the config was newly created.
        This is the case when the application was run the first time.
        """

        return self._new_config
