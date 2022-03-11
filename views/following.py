from flask import Response, request
from flask_restful import Resource
from models import Following, User, db, following
import json
import flask_jwt_extended

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    @flask_jwt_extended.jwt_required()
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        following = Following.query.filter_by(
        user_id = self.current_user.id).all()

        following_list_of_dicts = [
            follower.to_dict_following() for follower in following
        ]
        return Response(json.dumps(following_list_of_dicts), mimetype="application/json", status=200)
    
    @flask_jwt_extended.jwt_required()
    def post(self):
        body = request.get_json()
        user_id = body.get('user_id')
        try:
            user_id = int(user_id)
        except:
            response_obj = {
                'message': 'User ID not valid'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        u = User.query.get(user_id)
        if not u:
            response_obj = {
                'message': 'User ID not valid'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        try:
            follow = Following(self.current_user.id, user_id)
            db.session.add(follow)
            db.session.commit()
        except:
            response_obj = {
                'message': 'Duplicate post ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        return Response(json.dumps(follow.to_dict_following()), mimetype="application/json", status=201)


class FollowingDetailEndpoint(Resource):
    @flask_jwt_extended.jwt_required()
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        try:
            id = int(id)
        except:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        f = Following.query.get(id)
        if not f:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        if f.user_id != self.current_user.id:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        Following.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Following {0} successfully deleted.'.format(id)
            }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
