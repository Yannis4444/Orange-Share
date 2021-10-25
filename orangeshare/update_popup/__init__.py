import locale
import logging
import os
import threading
from typing import Optional

import pyperclip
import wx
from flask import make_response, send_file
from flask_restful import Resource

import orangeshare
from orangeshare import Config


class GetDataFrame(wx.Frame):

    def __init__(self, parent, ID, title, orange_share):
        """
        :param orange_share: The orangeshare instance
        """
        wx.Frame.__init__(self, parent, ID, title, style=wx.DEFAULT_FRAME_STYLE ^ wx.RESIZE_BORDER)

        self.orange_share = orange_share

        ico = wx.Icon(os.path.join(os.path.dirname(__file__), os.pardir, "logo/white.ico"), wx.BITMAP_TYPE_ICO)
        self.SetIcon(ico)

        text = wx.StaticText(self, label="Version {} of Orange Share is available.".format(orangeshare.newer_version), size=(400, -1), pos=(0, 0))

        self.checkbox = wx.CheckBox(self, label="don't show again")

        show_button = wx.Button(self, -1, size=(200, -1), label='Show Me')
        show_button.Bind(wx.EVT_BUTTON, self.on_show)

        ignore_button = wx.Button(self, -1, size=(200, -1), label='Ignore')
        ignore_button.Bind(wx.EVT_BUTTON, self.on_ignore)

        # layout
        grid = wx.GridBagSizer(10, 0)
        grid.Add(text, pos=(0, 0), span=(1, 2), flag=wx.CENTER)
        grid.Add(self.checkbox, pos=(1, 0), span=(1, 2), flag=wx.CENTER)
        grid.Add(show_button, pos=(2, 0), span=(1, 1), flag=wx.EXPAND)
        grid.Add(ignore_button, pos=(2, 1), span=(1, 1), flag=wx.EXPAND)

        self.SetSizerAndFit(grid)
        self.Layout()
        self.Centre()
        self.Show()

    def on_ignore(self, e):
        self.save_ignore()
        self.Close(True)

    def on_show(self, e):
        self.orange_share.open_ui("/update")
        self.Close(True)

    def save_ignore(self):
        config = Config.get_config()
        if self.checkbox.GetValue():
            config.config.set("UPDATE", "ignore", orangeshare.newer_version)
        else:
            config.config.set("UPDATE", "ignore", "")
        config.save()


class UpdatePopup(Resource):
    """
    Opens a dialog telling the user about a new update
    """

    def __init__(self, orange_share: 'Orangeshare'):
        """
        Creates the dialog
        :param orange_share: the orangeshare instance
        """

        logging.info("showing update popup")

        app = wx.App()
        # app.locale = wx.Locale(wx.Locale.GetSystemLanguage())
        locale.setlocale(locale.LC_ALL, 'C')
        frame = GetDataFrame(None, -1, "Update Available", orange_share=orange_share)
        frame.Show()
        app.MainLoop()
