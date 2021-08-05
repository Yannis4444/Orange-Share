"""
Orange-Share

A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS
"""

__version__ = "0.1.0"
__author__ = 'Yannis Vierkoetter'


import logging
from flask import Flask
from flask_restful import Api
from orangeshare.shortcuts import *

app = Flask(__name__)
api = Api(app)

api.add_resource(shortcuts.open.OpenFile, '/api/open/file')
api.add_resource(shortcuts.open.OpenURL, '/api/open/url')
api.add_resource(shortcuts.open.OpenText, '/api/open/text')
api.add_resource(shortcuts.clipboard.ClipboardText, '/api/clipboard/text')
api.add_resource(shortcuts.save.SaveFile, '/api/save/file')


logging.basicConfig(
    level=logging.DEBUG,
    format='[%(asctime)s] %(levelname)-8s %(name)-12s %(message)s',
)

app.run("0.0.0.0", 7616)
