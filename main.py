import logging

from flask import Flask
from flask_restful import Api

import shortcuts

app = Flask(__name__)
api = Api(app)

api.add_resource(shortcuts.open.OpenFile, '/api/open/file')
api.add_resource(shortcuts.open.OpenURL, '/api/open/url')
api.add_resource(shortcuts.clipboard.ClipboardText, '/api/clipboard/text')
api.add_resource(shortcuts.save.SaveFile, '/api/save/file')

if __name__ == '__main__':
    logging.basicConfig(
        level=logging.DEBUG,
        format='[%(asctime)s] %(levelname)-8s %(name)-12s %(message)s',
    )

    app.run("0.0.0.0", 7616)
