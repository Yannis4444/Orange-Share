from flask_restful import Resource, reqparse

from orangeshare.shortcuts.open.open_helper import open_url

parser = reqparse.RequestParser()
parser.add_argument('url',
                    type=str,
                    required=True,
                    help='provide an url')


class OpenURL(Resource):
    """
    Opens a given URL in the browser.
    """

    def post(self):
        args = parser.parse_args()

        return open_url(args["url"])
