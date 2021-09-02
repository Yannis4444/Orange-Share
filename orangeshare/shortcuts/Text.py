import logging

from flask_restful import Resource, reqparse

import orangeshare.shortcuts.handlers.open
import orangeshare.shortcuts.handlers.clipboard

parser = reqparse.RequestParser()
parser.add_argument('mode',
                    type=str,
                    required=True,
                    help='provide a mode')
parser.add_argument('text',
                    type=str,
                    required=True,
                    help='provide the text')
parser.add_argument('filename',
                    type=str,
                    required=False,
                    help='provide the filename')
parser.add_argument('file_extension',
                    type=str,
                    required=True,
                    help='provide the file_extension')


class Text(Resource):
    """
    Receives a text from a shortcut and calls the respective function for open, save and clipboard
    """

    def post(self):
        args = parser.parse_args()
        text = args["text"]
        filename = args["filename"] if "filename" in args else None
        file_extension = args["file_extension"]

        preview = text.split("\n")[0][:50]
        if len(preview) < len(text):
            preview += "..."

        logging.info("Received Text \"{}\" for {}".format(preview, args["mode"]))

        if args["mode"] == "open":
            return orangeshare.shortcuts.handlers.open.handle_text(text, filename, file_extension)

        elif args["mode"] == "save":
            return orangeshare.shortcuts.handlers.save.handle_text(text, filename, file_extension)

        elif args["mode"] == "clipboard":
            return orangeshare.shortcuts.handlers.clipboard.handle_text(text, filename, file_extension)

        return {"message": "unknown mode \"{}\"".format(args["mode"])}, 400
