import logging
from flask_restful import Resource, reqparse

from orangeshare.devices import create_device, get_device

parser = reqparse.RequestParser()
parser.add_argument('name',
                    type=str,
                    required=True,
                    help='provide the name')


class NewDevice(Resource):
    """
    Adds a new device, sets the uuid, returns the content for the QR Code.
    """

    def post(self):
        args = parser.parse_args()
        name = args["name"]

        id = create_device(name)

        logging.info("Creating new device: \"{}\"".format(name))

        return get_device(id)
