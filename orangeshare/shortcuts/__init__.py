from typing import Union, Tuple

from flask import request

CURRENT_SHORTCUT_VERSION = 7


def check_shortcut_version(return_dict: Union[dict, Tuple[dict, int], None] = None):
    """
    Will check the Shortcut version in the request header.
    If it is the correct version the return_dict will be returned as is.
    If the shortcut is outdated, a message with a request to update is sent.
    If no return_dict is supplied, {"success": True} will be used

    If the return_dict is a tuple also containing an http code, the http code will be returned as well

    :param return_dict: The dict to return
    :return: The dict (possibly with something added to the message) and maybe a http code
    """

    http_code = None
    if return_dict is None:
        return_dict = {"success": True}
    elif isinstance(return_dict, tuple):
        return_dict, http_code = return_dict

    if "ShortcutVersion" not in request.headers or int(request.headers["ShortcutVersion"]) < CURRENT_SHORTCUT_VERSION:
        if "message" in return_dict:
            return_dict["message"] += "\n----------------------\nThere are new shortcuts available. Please go to the settings panel to download them.\nThe old ones might still work but it is advised to download the new ones."
        else:
            return_dict["message"] = "There are new shortcuts available. Please go to the settings panel to download them.\nThe old ones might still work but it is advised to download the new ones."
    elif int(request.headers["ShortcutVersion"]) > CURRENT_SHORTCUT_VERSION:
        if "message" in return_dict:
            return_dict["message"] += "\n----------------------\nYou are using a shortcut version that is newer than the one needed for this version. You might encounter some problems."
        else:
            return_dict["message"] = "You are using a shortcut version that is newer than the one needed for this version. You might encounter some problems."

    if http_code is not None:
        return return_dict, http_code
    else:
        return return_dict
