import logging
from flask_restful import Resource, reqparse
import pyperclip
from notifypy import Notify

parser = reqparse.RequestParser()
parser.add_argument('text',
                    type=str,
                    required=True,
                    help='provide text')


class ClipboardText(Resource):
    """
    Copies the given Text to the clipboard.
    """

    def post(self):
        args = parser.parse_args()
        pyperclip.copy(args["text"])

        logging.info("copied to clipboard: {}".format(args["text"] if len(args["text"]) < 64 else args["text"][:64] + "..."))

        notification = Notify()
        notification.title = "Orange Share"
        notification.message = "Copied Text to clipboard:\n" + args["text"]
        # TODO: option to show content
        notification.send()

        return {'success': True}
