from flask_restful import Resource

class Version(Resource):
    """
    Returns Version Info.
    """

    def get(self):
        from orangeshare import Orangeshare
        return {"version": Orangeshare.get_orangeshare().version}
