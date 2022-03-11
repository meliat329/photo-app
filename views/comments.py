from flask import Response, request
from flask_restful import Resource
from . import can_view_post
import json
from models import db, Comment, Post
import flask_jwt_extended

class CommentListEndpoint(Resource):

    @flask_jwt_extended.jwt_required()
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self):
        body = request.get_json()
        post_id = body.get('post_id')
        comtext = body.get('text')
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
        if not comtext:
            response_obj = {
                'message': 'No comment text'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        newcomment = Comment(comtext, self.current_user.id, post_id)
        db.session.add(newcomment)
        db.session.commit()
        return Response(json.dumps(newcomment.to_dict()), mimetype="application/json", status=201)
        
class CommentDetailEndpoint(Resource):

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
        comment = Comment.query.get(id)
        if not comment:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        if comment.user_id != self.current_user.id:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        Comment.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Comment {0} successfully deleted.'.format(id)
            }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<id>', 
        '/api/comments/<id>',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
