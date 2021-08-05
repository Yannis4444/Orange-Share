from setuptools import setup

setup(
    name='orangeshare',
    version='0.1.0',
    description='A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS',
    url='https://github.com/Yannis4444/Orange-Share',
    author='Yannis Vierkoetter',
    author_email='yannis44@web.de',
    license='MIT',
    packages=[
        'orangeshare',
        'orangeshare.shortcuts',
        'orangeshare.shortcuts.clipboard',
        'orangeshare.shortcuts.open',
        'orangeshare.shortcuts.save'
    ],
    install_requires=[
        "flask",
        "flask_restful",
        "pyperclip",
        "notify-py",
        "validators",
        "wxpython"
    ],
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: End Users/Desktop',
        'License :: OSI Approved :: MIT License',
        'Framework :: Flask',
        'Natural Language :: English',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3',
        'Topic :: Communications :: File Sharing'
    ],
)
