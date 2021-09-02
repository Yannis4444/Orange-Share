from .New import NewDevice
from .Delete import DeleteDevice
from flask_restful import Resource, reqparse

from orangeshare.devices import get_devices


class GetDevices(Resource):
    """
    Adds a new device, sets the uuid, returns the content for the QR Code.
    """

    def get(self):
        return get_devices()
