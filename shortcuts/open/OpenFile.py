import datetime
import logging
import os
import subprocess
import sys
import tempfile
import werkzeug
from flask_restful import Resource, reqparse

parser = reqparse.RequestParser()
parser.add_argument('file',
                    type=werkzeug.datastructures.FileStorage,
                    location='files',
                    required=True,
                    help='provide a file')

# TODO: global for application, shutdownhook to clear
# A temporary directory to save the opened files to
temp_dir = tempfile.TemporaryDirectory()

def open_file(filename: str):
    """
    Opens the given file in the default application

    :param filename: The filename
    """

    if sys.platform == "win32":
        os.startfile(filename)
    else:
        opener = "open" if sys.platform == "darwin" else "xdg-open"
        subprocess.call([opener, filename], stdout=None)

class OpenFile(Resource):
    """
    Saves a given file to a temporary directory and then opens it in the default application.
    """

    def post(self):
        args = parser.parse_args()

        filename = args["file"].filename
        if filename == "":
            filename = datetime.datetime.now().isoformat()

        logging.info("opening File \"{}\"".format(filename))

        path = os.path.join(temp_dir.name, filename)
        args["file"].save(path)
        open_file(path)

        return {'success': True}