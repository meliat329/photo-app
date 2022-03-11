from flask import Response
from flask_restful import Resource
from models import LikePost, db, Post
import json
from . import can_view_post
import flask_jwt_extended

class PostLikesListEndpoint(Resource):
    
    @flask_jwt_extended.jwt_required()
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self, post_id):
        try:
            post_id = int(post_id)
        except:
            response_obj = {
                'message': 'Post ID not valid'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        post = Post.query.get(post_id)

        if not post:
            response_obj = {
                'message': 'Post ID not valid'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        if not can_view_post(post_id, self.current_user):
            response_obj = {
                'message': 'No access'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        try:
            like = LikePost(self.current_user.id, post_id)
            db.session.add(like)
            db.session.commit()
        except:
            response_obj = {
                'message': 'Duplicate like'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        return Response(json.dumps(like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    @flask_jwt_extended.jwt_required()
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, post_id, id):
        try:
            id = int(id)
        except:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        like = LikePost.query.get(id)
        if not like:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        if like.user_id != self.current_user.id:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        LikePost.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Like {0} successfully deleted.'.format(id)
            }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/<post_id>/likes', 
        '/api/posts/<post_id>/likes/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/<post_id>/likes/<id>', 
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
