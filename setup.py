import sys

from setuptools import setup, find_packages
from os import path

this_directory = path.abspath(path.dirname(__file__))
with open(path.join(this_directory, 'README.md')) as f:
    long_description = f.read()

install_requires=[
    "flask",
    "flask_restful",
    "pyperclip",
    "notify-py",
    "validators",
    "wxpython",
    "appdirs",
    "Flask-BasicAuth",
    "netifaces",
    "pillow",
    "werkzeug",
    "requests"
]

if sys.platform == "win32":
    install_requires.append("pystray")

setup(
    name='orangeshare',
    version='1.7.0',
    description='A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/Yannis4444/Orange-Share',
    author='Yannis Vierkoetter',
    author_email='yannis44@web.de',
    license='MIT',
    packages=find_packages(),
    include_package_data=True,
    install_requires=install_requires,
    classifiers=[
        'Intended Audience :: End Users/Desktop',
        'License :: OSI Approved :: MIT License',
        'Framework :: Flask',
        'Natural Language :: English',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3',
        'Topic :: Communications :: File Sharing'
    ],
    scripts=['orangeshare/orangeshare'],
)
