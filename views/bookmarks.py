from lib2to3.pytree import convert
from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db, Post
import json
from . import can_view_post


class BookmarksListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        #only show bms associated w current user
        bookmarks = Bookmark.query.filter_by(
            user_id = self.current_user.id).all()

        #convert list of bms to list of dicts
        bookmark_list_of_dicts = [
            bookmark.to_dict() for bookmark in bookmarks
        ]
        return Response(json.dumps(bookmark_list_of_dicts), mimetype="application/json", status=200)

    def post(self):
        #get post id from request body
        #check user is authorized to bm 
        #check post id exists and is valid
        #insert into database if top 3
        #return new bm object
        body = request.get_json()
        post_id = body.get('post_id')



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
            bookmark = Bookmark(self.current_user.id, post_id)
            db.session.add(bookmark)
            db.session.commit()
        except:
            response_obj = {
                'message': 'Duplicate post ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)

        return Response(json.dumps(bookmark.to_dict()), mimetype="application/json", status=201)

class BookmarkDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        try:
            id = int(id)
        except:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        bookmark = Bookmark.query.get(id)
        if not bookmark:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)

        if bookmark.user_id != self.current_user.id:
            response_obj = {
                'message': 'Not a valid ID'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        Bookmark.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Bookmark {0} successfully deleted.'.format(id)
            }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)
        



def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint, 
        '/api/bookmarks', 
        '/api/bookmarks/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint, 
        '/api/bookmarks/<id>', 
        '/api/bookmarks/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
