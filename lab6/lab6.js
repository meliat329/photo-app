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