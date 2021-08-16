import argparse
import logging

from orangeshare import Orangeshare


def get_args() -> argparse.Namespace:
    """
    Gets all commandline arguments and validates them.

    :return: The arguments
    """

    parser = argparse.ArgumentParser(description='A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS')
    parser.add_argument('-p', '--port', required=False, type=int, help="Port number of the measurement server (default: 7616)", metavar="<port>", default=7616)
    parser.add_argument('-o', '--open-ui', required=False, action='count', help="Open the server controls in the browser")
    parser.add_argument('-v', '--verbose', required=False, action='count', default=0, help="enable Verbose output")
    return parser.parse_args()


if __name__ == '__main__':
    args = get_args()

    # set logging level
    if args.verbose:
        logging.basicConfig(
            level=logging.DEBUG,
            format='[%(asctime)s] %(levelname)-8s %(name)-12s %(message)s',
        )

    orangeshare = Orangeshare(args.port)
    orangeshare.run(bool(args.open_ui))
