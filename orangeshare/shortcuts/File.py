import datetime
import logging
import werkzeug
from flask_restful import Resource, reqparse

import orangeshare.shortcuts.handlers.open
import orangeshare.shortcuts.handlers.save
import orangeshare.shortcuts.handlers.clipboard

parser = reqparse.RequestParser()
parser.add_argument('mode',
                    type=str,
                    required=True,
                    help='provide a mode')
parser.add_argument('file',
                    type=werkzeug.datastructures.FileStorage,
                    location='files',
                    required=True,
                    help='provide a file')


class File(Resource):
    """
    Receives a file from a shortcut and calls the respective function for open, save and clipboard
    """

    def post(self):
        args = parser.parse_args()

        filename = args["file"].filename
        if filename == "":
            filename = datetime.datetime.now().isoformat()

        logging.info("Received File \"{}\" for {}".format(filename, args["mode"]))

        if args["mode"] == "open":
            return orangeshare.shortcuts.handlers.open.handle_file(args["file"], filename)

        elif args["mode"] == "save":
            return orangeshare.shortcuts.handlers.save.handle_file(args["file"], filename)

        elif args["mode"] == "clipboard":
            return orangeshare.shortcuts.handlers.clipboard.handle_file(args["file"], filename)

        return {"message": "unknown mode \"{}\"".format(args["mode"])}, 400
