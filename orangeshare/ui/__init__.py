from flask import render_template, send_from_directory


def index():
    return render_template("index.html")


def favicon():
    return send_from_directory("logo", "white.ico")
