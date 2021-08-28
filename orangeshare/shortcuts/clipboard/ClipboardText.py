import logging
from flask_restful import Resource, reqparse
import pyperclip

from orangeshare import Config
from orangeshare.notify import notify

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

        config = Config.get_config()
        if config.config.getboolean("CLIPBOARD", "notification", fallback=True):
            if config.config.getboolean("CLIPBOARD", "notification_content", fallback=True):
                notify("Copied Text to clipboard:\n" + args["text"])
            else:
                notify("Copied Text to clipboard")

        return {'success': True}
