import json
import logging
from flask_restful import Resource, reqparse

from orangeshare.devices import delete_device

parser = reqparse.RequestParser()
parser.add_argument('id',
                    type=str,
                    required=True,
                    help='provide the id')


class DeleteDevice(Resource):
    """
    Adds a new device, sets the uuid, returns the content for the QR Code.
    """

    def post(self):
        args = parser.parse_args()
        id = args["id"]

        logging.info("Deleting device: \"{}\"".format(id))

        return delete_device(id)
