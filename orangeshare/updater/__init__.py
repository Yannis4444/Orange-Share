import logging
import os
import subprocess
import sys
import threading
from typing import Optional, List, Tuple

import requests

from orangeshare import Config
from orangeshare.temp_dir import temp_dir
from orangeshare.updater.UpdatePopup import UpdatePopup


class Updater:
    _instance = None

    @staticmethod
    def get_updater() -> 'Updater':
        """
        Get the updater (singleton)

        :return: The updater
        """

        if Updater._instance is None:
            Updater()
        return Updater._instance

    def __init__(self):
        """
        Creates a new Updater instance.
        Should not be called.
        Instead use get_updater.
        """

        if Updater._instance is not None:
            raise Exception("Updater is a singleton")
        else:
            Updater._instance = self

        self.newer_version_available: Optional[bool] = None
        self.newer_version: Optional[str] = None
        self.newer_version_executables: List[List[str]] = []

    def get_github_version(self) -> Tuple[str, List[List[str]]]:
        """
        Checks if a newer Version of Orange Share is available using the github API.

        :return The version and the executables from the latest release
        """

        response = requests.get("https://api.github.com/repos/Yannis4444/orange-share/releases/latest").json()

        version = response["tag_name"].replace("v", "")

        logging.info("got newest available version from GitHub: {}".format(version))

        # get the executables
        newer_version_executables = []
        for asset in response["assets"]:
            if asset["name"].endswith(".exe"):
                newer_version_executables.append([asset["name"], asset["browser_download_url"]])

        return version, newer_version_executables

    def get_pip_version(self) -> Tuple[str, Optional[List[List[str]]]]:
        """
        Checks if a newer Version of Orange Share is available using the PyPi API.

        :return The version
        """

        response = requests.get("https://pypi.org/pypi/orangeshare/json").json()
        version = response["info"]["version"]

        logging.info("got newest available version from PyPi: {}".format(version))

        return version

    def check_for_new_version(self, orange_share, current):
        """
        Checks if a newer Version of Orange Share is available using the github API.
        Will run the request as a Thread to avoid blocking.
        Result will be written to self.newer_version_available.
        True if a newer Version is available, False if not or the request failed

        will open the pop up if a new version is available

        :param orange_share: the orangeshare instance
        :param current: the current version
        """

        if self.newer_version_available is not None:
            # already run
            return

        def get_version(updater, orange_share):
            try:
                if "--windows-installation" in sys.argv:
                    version, self.newer_version_executables = self.get_github_version()
                else:
                    version = self.get_pip_version()
                available_version = version.split(".")
                current_version = current.split(".")
                updater.newer_version_available = current_version[0] < available_version[0] or (current_version[0] == available_version[0] and current_version[1] < available_version[1] or (current_version[0] == available_version[0] and current_version[1] == available_version[1] and current_version[2] < available_version[2]))
                if updater.newer_version_available:

                    logging.info("there is a newer version available")

                    updater.newer_version = version

                    # check if popup has to be opened
                    config = Config.get_config()
                    ignored_version = config.config.get("UPDATE", "ignore", fallback="")
                    if ignored_version != updater.newer_version:
                        UpdatePopup(orange_share, updater.newer_version)
            except Exception as e:
                logging.info("could not check if newer version is available: {}".format(e))

        threading.Thread(target=get_version, args=(self, orange_share,)).start()

    def windows_update(self) -> Tuple[bool, Optional[str]]:
        """
        Downloads the newest executable from GitHub and runs it.

        :return True if successful and an optional error string
        """

        logging.info("downloading new version")

        updater = Updater.get_updater()

        # choose the right executable
        url = ""
        name = ""
        for n, u in updater.newer_version_executables:
            if n == f"orangeshare-{updater.newer_version}.exe":
                url = u
                name = n
                break

        if not url:
            return False, "No installer found in newest Release"

        r = requests.get(url)
        filename = os.path.join(temp_dir.name, name)

        with open(filename, 'wb') as output_file:
            output_file.write(r.content)

        logging.info("download complete")

        logging.info("running updater")
        subprocess.Popen([filename, "/SILENT"])

        return True, None

    def pip_update(self) -> Tuple[bool, Optional[str]]:
        """
        Runs pip install --upgrade orangeshare.

        :return True if successful and an optional error string
        """

        cmd = [sys.executable, "-m", "pip", "install", "--upgrade", "orangeshare"]

        logging.info("running {}".format(" ".join(cmd)))

        try:
            subprocess.check_call(cmd)
        except subprocess.CalledProcessError as e:
            logging.error("failed to upgrade from pip: {}".format(e))
            return False, str(e)

        logging.info("successfully upgraded orangeshare")

        return True, None
