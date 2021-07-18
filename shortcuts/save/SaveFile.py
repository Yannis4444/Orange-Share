import datetime
import logging
import os.path
from typing import Optional
import wx
import werkzeug
from flask_restful import Resource, reqparse

parser = reqparse.RequestParser()
parser.add_argument('file',
                    type=werkzeug.datastructures.FileStorage,
                    location='files',
                    required=True,
                    help='provide a file')

# TODO: save in config
last_saving_directory = ""

file_dialog_open = False


def file_dialog(directory='', filename='', extension: Optional[str] = None) -> Optional[str]:
    """
    Opens a file dialog and returns the selected file.

    :param directory: The directory to open in
    :param filename: The default file name
    :param extension: The extension without .
    :return: The selected file or None
    """

    global file_dialog_open

    if file_dialog_open:
        # can't open second time
        # TODO: reasonable solution
        return None

    file_dialog_open = True

    wildcard = None
    if extension:
        wildcard = "*." + extension

    app = wx.App(None)
    dialog = wx.FileDialog(None, 'Open', wildcard=wildcard, style=wx.FD_SAVE, defaultDir=directory, defaultFile=filename)
    if dialog.ShowModal() == wx.ID_OK:
        path = dialog.GetPath()
    else:
        path = None
    dialog.Destroy()

    file_dialog_open = False
    return path


class SaveFile(Resource):
    """
    Opens a save dialog and saves the given file to it.
    """

    def post(self):
        global last_saving_directory

        args = parser.parse_args()

        filename = args["file"].filename
        if not filename:
            filename = datetime.datetime.now().isoformat()

        extension = filename.split(".")[-1]
        if extension == filename:
            extension = ""

        if extension:
            f = file_dialog(directory=last_saving_directory, filename=filename, extension=extension)
        else:
            f = file_dialog(directory=last_saving_directory, filename=filename)
        if not f:
            logging.error("Error while saving file: No file destination was selected")
            return {"message": "No file destination was selected"}, 500

        if not f.endswith(extension):
            f += "." + extension

        last_saving_directory = os.path.dirname(os.path.abspath(f))

        logging.info("saving File \"{}\"".format(f))

        args["file"].save(f)

        return {'success': True}
