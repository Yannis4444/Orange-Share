import argparse
import logging

from orangeshare import Orangeshare


def get_args() -> argparse.Namespace:
    """
    Gets all commandline arguments and validates them.

    :return: The arguments
    """

    parser = argparse.ArgumentParser(description='A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS')
    parser.add_argument('--version', required=False, action='count', default=0, help="Print the Version")
    parser.add_argument('-p', '--port', required=False, type=int, help="Port number of the measurement server (default: 7616)", metavar="<port>", default=7616)
    parser.add_argument('-o', '--open-ui', required=False, action='count', help="Open the server controls in the browser")
    parser.add_argument('-v', '--verbose', required=False, action='count', default=0, help="enable Verbose output")

    args = parser.parse_args()

    if args.version:
        from orangeshare import __version__
        print(__version__)
        exit(0)

    return args


def main():
    args = get_args()

    # set logging level
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format='[%(asctime)s] %(levelname)-8s %(name)-12s %(message)s',
    )

    orangeshare = Orangeshare(args.port)
    orangeshare.run(bool(args.open_ui))


if __name__ == '__main__':
    main()
