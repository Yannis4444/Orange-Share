import base64
import json
import logging
import socket
import uuid
from typing import Dict

from orangeshare.config import Config


def check_credentials(username: str, password: str) -> bool:
    """
    Is used for the basic auth.
    Checks if a device with the an id identical to the passord exists.
    The username should always be "device"

    :param username: The username from the request
    :param password: The password from the request
    :return: True if a device with these credentials exists
    """

    if username != "device":
        logging.warning("Received request with wrong username \"{}\"".format(username))
        return False

    if Config.get_config().config.get("DEVICES", password, fallback=None) is None:
        logging.warning("Received request with unknown id")
        return False

    return True


def create_device(name: str) -> str:
    """
    Creates a new device with the given name
    The id will be set here.
    The device will be saved

    :param name: The name of the device
    :return: The id
    """

    id = str(uuid.uuid4())

    config = Config.get_config()
    config.config["DEVICES"][id] = name
    config.save()

    return id

def get_device(id):
    """
    The info for one device

    :param id: The device
    :return: The info
    """

    return {
        "name": Config.get_config().config.get("DEVICES", id),
        "id": id,
    }

def get_devices() -> Dict[str, str]:
    """
    Gets a list of devices from the config

    :return:
    """

    return {id: get_device(id) for id in Config.get_config().config["DEVICES"].keys()}


def delete_device(id: str):
    """
    Deletes the device with the given name from the config

    :param id: The ID of the device to delete
    """

    config = Config.get_config()
    config.config.remove_option("DEVICES", id)
    config.save()
