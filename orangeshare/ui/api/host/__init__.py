import logging
import socket

from flask_restful import Resource, reqparse
from netifaces import interfaces, ifaddresses, AF_INET

from orangeshare import Config

parser = reqparse.RequestParser()
parser.add_argument('interface',
                    type=str,
                    required=False,
                    help='provide the interface')
parser.add_argument('name',
                    type=str,
                    required=False,
                    help='provide the name of the host')


class Host(Resource):
    """
    Information about the host
    """

    def get(self):
        """
        Get a JSON of all the available network interfaces and their IPs as well as the hostname

        :return: The interfaces and IPs
        """

        ip_list = {}
        for interface in interfaces():
            ifaddrs = ifaddresses(interface)
            if AF_INET in ifaddrs:
                for link in ifaddrs[AF_INET]:
                    ip_list[interface] = link['addr']

        config = Config.get_config()

        if len(ip_list) > 0:
            active_interface = config.config.get("HOST", "interface")
            if active_interface not in ip_list:
                active_interface = next(iter(ip_list))
        else:
            active_interface = None

        name = config.config.get("HOST", "name") or socket.gethostname()

        return {"interfaces": ip_list, "active_interface": active_interface, "name": name, "port": config.api_port}

    def post(self):
        """
        Set the interface and hostname
        """

        args = parser.parse_args()

        config = Config.get_config()

        if "interface" in args and args["interface"] is not None:
            interface = args["interface"]
            config.config.set("HOST", "interface", interface)
            logging.info("Setting interface to {}".format(interface))

        if "name" in args and args["name"] is not None:
            name = args["name"]
            config.config.set("HOST", "name", name)
            logging.info("Setting name to {}".format(name))

        config.save()

        return {"success": True}
