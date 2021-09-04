#!/usr/bin/env python3
import os

from orangeshare.__main__ import main

if __name__ == '__main__':
    os.chdir(os.path.join(os.path.abspath(os.path.dirname(__file__)), "orangeshare"))

    main()
