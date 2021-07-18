import tempfile
import validators
from flask_restful import Resource, reqparse

from shortcuts.open.open_helper import open_url, open_text

parser = reqparse.RequestParser()
parser.add_argument('text',
                    type=str,
                    required=True,
                    help='provide the content as text')

# TODO: global for application
# A temporary directory to save the opened files to
temp_dir = tempfile.TemporaryDirectory()


class OpenText(Resource):
    """
    Opens a given resource
    Decides what to do tepending of the given type
    Saves a given file to a temporary directory and then opens it in the default application.
    """

    def post(self):
        args = parser.parse_args()
        text = args["text"]

        if validators.url(text):
            return open_url(text)
        else:
            # Firefox pages are weird...
            text_split = text.split("\n")
            if len(text_split) == 2 and validators.url(text_split[1]):
                return open_url(text_split[1])

        open_text(text)

        return {'success': True}
