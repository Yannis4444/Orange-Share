from flask_restful import Resource, reqparse
from orangeshare.config import Config

from orangeshare.notify import notify
from orangeshare.shortcuts import check_shortcut_version

parser = reqparse.RequestParser()
parser.add_argument('id',
                    type=str,
                    required=True,
                    help='provide an id')


class Connected(Resource):
    """
    Called from the Connection Manager once the connection is established
    Shows a notification about the new connection
    """

    def post(self):
        args = parser.parse_args()

        notify(Config.get_config().config.get("DEVICES", args["id"], fallback="Unknown User") + " connected")

        return check_shortcut_version()
