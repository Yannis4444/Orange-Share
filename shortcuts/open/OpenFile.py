import datetime
import logging
import os
import werkzeug
from flask_restful import Resource, reqparse

from main import temp_dir
from shortcuts.open.open_helper import open_file

parser = reqparse.RequestParser()
parser.add_argument('file',
                    type=werkzeug.datastructures.FileStorage,
                    location='files',
                    required=True,
                    help='provide a file')


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
