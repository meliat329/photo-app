////////////////////////////////
/////////////STORIES////////////
////////////////////////////////
const story2Html = story => {
    return `
        <div>
            <img src="${ story.user.thumb_url }" class="pic" alt="profile pic for ${ story.user.username }" />
            <p>${ story.user.username }</p>
        </div>
    `;
};

// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = html;
        })
};

const initPage = () => {
    displayStories();
};

// invoke init page to display stories:
initPage();


////////////////////////////////
/////////////SUGGESTIONS////////
////////////////////////////////
const toggleFollow = ev => {
    console.log(ev);
    const elem = ev.currentTarget;
    console.log(elem.dataset);
    console.log(elem.dataset.userId);
    console.log(elem.innerHTML);
    if (elem.innerHTML === "follow") {
        followUser(elem.dataset.userId, elem);
    }
    else{
        unfollowUser(elem.dataset.followingId, elem);
    }



};

const followUser = (userId, elem) => {
    const postData = {
        "user_id": userId
    };
    
    fetch("http://localhost:5000/api/following/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = "unfollow";
            elem.classList.add("unfollow");
            elem.classList.remove("follow");
            // so we can unfollow
            elem.setAttribute('data-following-id', data.id);
            elem.setAttribute('aria-checked', 'True');
        });
};

const unfollowUser = (followingId, elem) => {
    const deleteURL = `http://localhost:5000/api/following/${followingId}`;
    
    fetch(deleteURL, {
            method: "DELETE",
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = "follow";
            elem.classList.add("follow");
            elem.classList.remove("unfollow");
            elem.removeAttribute('data-following-id', data.id);
            elem.setAttribute('aria-checked', 'False');
        });
};

const user2Html = user => {
    return `
    <div class="suggestion">
        <img src="${user.thumb_url}" />
        <div>
            <p class="username">${user.username}</p>
            <p class="sugg-text">Suggested for you</p>
        </div>
        <div>
            <button class="follow"
            aria-label="Follow"
            aria-checked="False"
            data-user-id="${user.id}"
            onclick="toggleFollow(event);">follow</button>
        </div>
    </div>
    `;
}

const getSuggestions = () => {
    fetch('http://localhost:5000/api/suggestions/')
        .then(response => response.json())
        .then(users => {
            console.log(users);
            const html = users.map(user2Html).join('\n');
            document.querySelector('#suggestions').innerHTML = html;
        });
    };

getSuggestions();

////////////////////////////////
/////////////PROFILE////////////
////////////////////////////////
const profile2Html = user => {
    return `
        <li><img src="${ user.thumb_url }" class="pic" alt="profile pic for ${ user.username }" /></li>
        <li><p class="username">${ user.username }</p></li>
    `;
};

// fetch data from your API endpoint:
const displayUser = () => {
    fetch('http://localhost:5000/api/profile/')
        .then(response => response.json())
        .then(user => {
            const html = profile2Html(user);
            document.querySelector('.user-info').innerHTML = html;
        })
};


displayUser();

////////////////////////////////
/////////////POSTS//////////////
////////////////////////////////

const post2Html = post => {
    var comments = postComments2HTML(post);
    var likeicon = likeIcon2HTML(post);
    var bmicon = bmIcon2HTML(post);
    return `
    <div class="post">
    <div class="topPost">
        <h3>${post.user.username}</h4>
        <i class="fas fa-ellipsis-h"></i>
    </div>
    <img src=${post.image_url} alt="Post image">
    <div class="commentsNStuff">
        <div class="iconBar">
            <div class="rightIcons">
                <button>${likeicon}</button>
                <button><i class="far fa-comment"></i></button>
                <button><i class="far fa-paper-plane"></i></button>
            </div>
            <button>${bmicon}</button>
        </div>
        <div class="likesContainer">
            <p>${post.likes.length} likes</p>
        </div>
        <div class="caption">
            <p><b>${post.user.username}</b> ${post.caption}</p> <a href="#">more</a>
        </div>
        <div class="comments">
            ${comments}
        </div>
        <p>${post.display_time}</p>
    </div>
    <div class="addComment">
        <div class="interact">
            <input type="text" id="com${post.id}" name="com" placeholder="Add a comment...">
        </div>
        <input onclick="postComment(event);" data-post-id="${post.id}" type="submit" value="Post">
    </div>
</div>
    `;
};

const likeIcon2HTML = post => {
    likeiconhtml = ``;
    if(post.current_user_like_id) {
        likeiconhtml = 
        `
        <i class="fas fa-heart"
                data-post-id="${post.id}"
                data-like-id="${post.current_user_like_id}"
                aria-label="Like"
                aria-checked="True"
                onclick="toggleLike(event);"></i>
        `;
    }
    else{
        likeiconhtml = 
        `
        <i class="far fa-heart"
                data-post-id="${post.id}"
                aria-label="Like"
                aria-checked="False"
                onclick="toggleLike(event);"></i>
        `;
    }
    return likeiconhtml;
}

const postComments2HTML = post => {
    var html = ``;
    if (post.comments.length > 1) {
        html = 
        `
        <a href="#">View all ${post.comments.length} comments</a>
        <p><b>${post.comments[0].user.username}</b> ${ post.comments[0].text }</p>
        `;
    }
    else{
        for (let i = 0; i < post.comments.length; i++) {
            newcomment =
            `
            <p><b>${ post.comments[i].user.username }</b> ${ post.comments[i].text }</p>
            `;
            html = html + newcomment;
        }
    }
    return html;
}
// fetch data from your API endpoint:
const displayPosts = () => {
    fetch('http://localhost:5000/api/posts/')
        .then(response => response.json())
        .then(post => {
            const html = post.map(post2Html).join('\n');
            document.querySelector('#posts').innerHTML = html;
        })
};



const toggleLike = ev => {
    console.log(ev);
    const elem = ev.currentTarget;
    console.log(elem.dataset);
    console.log(elem.dataset.postId);
    console.log(elem.innerHTML);
    if (elem.classList.contains("far")) {
        likePost(elem.dataset.postId, elem);
    }
    else{
        unlikePost(elem.dataset.postId, elem.dataset.likeId, elem);
    }



};

const likePost = (postId, elem) => {
    const postData = {
        "post_id": postId
    };
    
    fetch(`http://localhost:5000/api/posts/${postId}/likes/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.classList.remove("far", "fa-heart");
            elem.classList.add("fas", "fa-heart");
            // so we can unfollow
            elem.setAttribute('data-like-id', data.id);
            elem.setAttribute('aria-checked', 'True');
        });
    displayPosts();
};

const unlikePost = (postId, likeId, elem) => {
    const deleteURL = `http://localhost:5000/api/posts/${postId}/likes/${likeId}`;
    
    fetch(deleteURL, {
            method: "DELETE",
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.classList.remove("fas", "fa-heart");
            elem.classList.add("far", "fa-heart");
            elem.removeAttribute('data-like-id', data.id);
            elem.setAttribute('aria-checked', 'False');
        });
        displayPosts();
};

const bmIcon2HTML = post => {
    bmiconhtml = ``;
    if(post.current_user_bookmark_id) {
        bmiconhtml = 
        `
        <i class="fas fa-bookmark"
                data-post-id="${post.id}"
                data-bookmark-id="${post.current_user_bookmark_id}"
                aria-label="Bookmark"
                aria-checked="True"
                onclick="toggleBookmark(event);"></i>
        `;
    }
    else{
        bmiconhtml = 
        `
        <i class="far fa-bookmark"
                data-post-id="${post.id}"
                aria-label="Bookmark"
                aria-checked="False"
                onclick="toggleBookmark(event);"></i>
        `;
    }
    return bmiconhtml;
}

const toggleBookmark = ev => {
    console.log(ev);
    const elem = ev.currentTarget;
    console.log(elem.dataset);
    console.log(elem.dataset.postId);
    console.log(elem.innerHTML);
    if (elem.classList.contains("far")) {
        bmPost(elem.dataset.postId, elem);
    }
    else{
        unbmPost(elem.dataset.bookmarkId, elem);
    }



};

const bmPost = (postId, elem) => {
    const postData = {
        "post_id": postId
    };
    
    fetch(`http://localhost:5000/api/bookmarks/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.classList.remove("far", "fa-bookmark");
            elem.classList.add("fas", "fa-bookmark");
            // so we can unfollow
            elem.setAttribute('data-bookmark-id', data.id);
            elem.setAttribute('aria-checked', 'True');
        });
};

const unbmPost = (bmId, elem) => {
    const deleteURL = `http://localhost:5000/api/bookmarks/${bmId}`;
    
    fetch(deleteURL, {
            method: "DELETE",
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.classList.remove("fas", "fa-bookmark");
            elem.classList.add("far", "fa-bookmark");
            elem.removeAttribute('data-bm-id', data.id);
            elem.setAttribute('aria-checked', 'False');
        });
};

const postComment = ev => {
    console.log(ev);
    const elem = ev.currentTarget;
    console.log(elem.dataset);
    console.log(elem.dataset.postId);
    console.log(elem.innerHTML);
    addComment(elem.dataset.postId, document.getElementById("com"+elem.dataset.postId.toString()).value);
}

const addComment = (postId, text) => {
    const postData = {
        "post_id": postId,
        "text": text
    };
    
    fetch("http://localhost:5000/api/comments", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });

    displayPosts();
};

displayPosts();
