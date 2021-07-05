import logging

from flask_restful import Resource, reqparse, abort
import webbrowser

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

        if args["url"] == "":
            logging.error("can't open URL: URL is empty")
            return {"message": "URL is empty"}, 400

        logging.info("opening URL \"{}\"".format(args["url"]))

        webbrowser.open(args["url"])

        return {'success': True}
