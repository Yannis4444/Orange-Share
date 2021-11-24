import locale
import logging
import os
import threading
from typing import Optional

import pyperclip
import wx
from flask import make_response, send_file
from flask_restful import Resource

from orangeshare import Config


class DropTarget(wx.FileDropTarget):
    def __init__(self, obj, result_data):
        wx.FileDropTarget.__init__(self)
        self.obj = obj
        self.result_data = result_data

    def OnDropFiles(self, x, y, filenames):
        logging.info("{} dropped into get data dialog".format(filenames[0]))

        self.result_data["filename"] = filenames[0]

        self.obj.Parent.Close()

        return True


class GetDataFrame(wx.Frame):

    def __init__(self, parent, ID, title, result_data):
        """
        :param result_data: The dictionary to write the data to
        """
        wx.Frame.__init__(self, parent, ID, title, style=wx.DEFAULT_FRAME_STYLE ^ wx.RESIZE_BORDER)

        self.result_data = result_data
        self.dialog: Optional[wx.FileDialog] = None

        self.dark_mode = sum(self.GetBackgroundColour()[0:3]) < 128 * 3

        # destroy the window after 60 s as the Shortcut will time out at that time
        threading.Timer(60, self.try_destroying).start()

        ico = wx.Icon(os.path.join(os.path.dirname(__file__), "../../logo/white.ico"), wx.BITMAP_TYPE_ICO)
        self.SetIcon(ico)
        self.Show()

        # file icon
        file_panel = wx.Panel(self, -1, style=wx.NO_BORDER)
        file_panel.SetCursor(wx.Cursor(wx.CURSOR_HAND))
        bmp1 = wx.Image(os.path.join(os.path.dirname(__file__), "icons/file_dark_mode.png" if self.dark_mode else "icons/file_light_mode.png"), wx.BITMAP_TYPE_ANY).Scale(200, 200, wx.IMAGE_QUALITY_HIGH).ConvertToBitmap()
        file_bitmap = wx.StaticBitmap(file_panel, -1, bmp1, (0, 0))

        file_bitmap.Bind(wx.EVT_LEFT_UP, self.on_file_click)

        self.file_drop_target = DropTarget(file_panel, result_data)
        file_panel.SetDropTarget(self.file_drop_target)

        # clipboard icon
        clipboard_panel = wx.Panel(self, -1, style=wx.NO_BORDER)
        clipboard_panel.SetCursor(wx.Cursor(wx.CURSOR_HAND))
        bmp2 = wx.Image(os.path.join(os.path.dirname(__file__), "icons/clipboard_dark_mode.png" if self.dark_mode else "icons/clipboard_light_mode.png"), wx.BITMAP_TYPE_ANY).Scale(200, 200, wx.IMAGE_QUALITY_HIGH).ConvertToBitmap()
        file_bitmap = wx.StaticBitmap(clipboard_panel, -1, bmp2, (0, 0))

        file_bitmap.Bind(wx.EVT_LEFT_UP, self.on_clipboard)

        # cancel button
        cancel_button = wx.Button(self, -1, label='Cancel')
        cancel_button.Bind(wx.EVT_BUTTON, self.on_cancel)

        # layout
        grid = wx.GridBagSizer(10, 10)
        grid.Add(wx.StaticText(self, label="A device requested data from this Computer using Orange Share.\nYou can either select a file or send the current content of the clipboard.", size=(400, -1), pos=(0, 0), style=wx.ALIGN_CENTER), pos=(0, 0), span=(1, 2), flag=wx.CENTER)
        grid.Add(file_panel, pos=(1, 0), span=(1, 1), flag=wx.EXPAND)
        grid.Add(clipboard_panel, pos=(1, 1), span=(1, 1), flag=wx.EXPAND)
        grid.Add(cancel_button, pos=(2, 0), span=(1, 2), flag=wx.EXPAND)

        self.SetSizerAndFit(grid)
        self.Layout()
        self.Centre()
        self.Show()

    def on_file_click(self, e):
        config = Config.get_config()
        default_dir = config.config.get("GETDATA", "last_location", fallback="")

        self.dialog = wx.FileDialog(self, 'Send', style=wx.FD_OPEN, defaultDir=default_dir)
        if self.dialog.ShowModal() == wx.ID_OK:
            path = self.dialog.GetPath()
            self.result_data["filename"] = path
            logging.info("{} opened in get data dialog".format(path))
            config.config.set("GETDATA", "last_location", os.path.dirname(os.path.abspath(path)))
            config.save()
        else:
            path = None
            logging.info("no file opened in get data dialog".format(path))
        self.dialog.Destroy()
        self.Close(True)

    def on_clipboard(self, e):
        logging.info("got clipboard content")
        self.result_data["text"] = pyperclip.paste()
        self.Close(True)

    def on_cancel(self, e):
        self.Close(True)

    def try_destroying(self):
        if not self.dialog:
            try:
                self.Close(True)
                # updates the window for the close to take effect
                self.Disable()
            except:
                pass


class GetData(Resource):
    """
    Opens a short dialog and sends the selected data back to the device
    """

    def get(self):
        logging.info("data requested")

        result = {}

        app = wx.App()
        # app.locale = wx.Locale(wx.Locale.GetSystemLanguage())
        locale.setlocale(locale.LC_ALL,'C')
        frame = GetDataFrame(None, -1, "Send Data to Device", result_data=result)
        frame.Show()
        app.MainLoop()

        if "filename" in result:
            return send_file(result["filename"])
        elif "text" in result:
            response = make_response(result["text"], 200)
            response.mimetype = "text/plain"
            return response
