from flask import Response, request
from flask_restful import Resource
from models import User
from . import get_authorized_user_ids
import json
import flask_jwt_extended

class SuggestionsListEndpoint(Resource):

    @flask_jwt_extended.jwt_required()
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        notsuggestions = get_authorized_user_ids(self.current_user)
        suggestions = User.query.filter(~User.id.in_(notsuggestions)).all()   
        
        suggestion_list_of_dicts = [
            sugg.to_dict() for sugg in suggestions
        ]

        suggestion_list_of_dicts = suggestion_list_of_dicts[0:7]
            
        return Response(json.dumps(suggestion_list_of_dicts), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        SuggestionsListEndpoint, 
        '/api/suggestions', 
        '/api/suggestions/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
