from flask_restful import Resource

from orangeshare.updater import Updater


class WindowsUpdate(Resource):
    """
    Downloads the Windows installer and runs it
    """

    def post(self):
        """
        Downloads the Windows installer and runs it
        """

        try:
            success, message = Updater.get_updater().windows_update()

            if success:
                return {"success": True}
            else:
                return {"success": False, "message": message}, 500
        except Exception as e:
            return {"success": False, "message": str(e)}, 500


class PipUpdate(Resource):
    """
    Update the pip package
    """

    def post(self):
        """
        Update the pip package
        """

        try:
            success, message = Updater.get_updater().pip_update()

            if success:
                return {"success": True}
            else:
                return {"success": False, "message": message}, 500
        except Exception as e:
            return {"success": False, "message": str(e)}, 500
