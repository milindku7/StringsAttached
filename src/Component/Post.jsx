import React, { useState, useEffect, useCallback } from "react";
import "../App.css";
import CommentForm from "./CommentForm.jsx";
import helpIcon from "../assets/delete.png";
import commentIcon from "../assets/comment.svg";
import likeIcon from "../assets/thumbsup.png";

const Post = ({ post, type, loadPosts }) => {
  const [showModal, setShowModal] = useState(false);
  const [showTags, setShowTags] = useState(post.reactions.length > 0);
  const [comments, setComments] = useState(parseInt(post._count.children));
  const [postComments, setPostComments] = useState([]);

  const tagPost = (tag, thisPostID) => {
    // Find the reaction from the current user
    let userReaction = -1;
    post.reactions.forEach((reaction) => {
      if (reaction.reactorID === parseInt(sessionStorage.getItem("user"))) {
        userReaction = reaction.id;
      }
    });

    if (userReaction >= 0) {
      // Delete the existing reaction
      fetch(
          process.env.REACT_APP_API_PATH + "/post-reactions/" + userReaction,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
          }
      ).then(
          () => loadPosts(),
          (error) => {
            alert("error!" + error);
          }
      );
    } else {
      // Create a new reaction
      fetch(process.env.REACT_APP_API_PATH + "/post-reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
          reactorID: sessionStorage.getItem("user"),
          postID: thisPostID,
          name: "like",
        }),
      }).then(
          () => loadPosts(),
          (error) => {
            alert("error!" + error);
          }
      );
    }
  };

  const showHideComments = () => {
    return showModal ? "comments show" : "comments hide";
  };

  const showHideTags = () => {
    if (showTags) {
      if (post.reactions.length > 0) {
        for (let i = 0; i < post.reactions.length; i++) {
          if (post.reactions[i].reactorID === sessionStorage.getItem("user")) {
            return "tags show tag-active";
          }
        }
      }
      return "tags show";
    }
    return "tags hide";
  };

  const deletePost = (postID) => {
    fetch(process.env.REACT_APP_API_PATH + "/posts/" + postID, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    })
        .then(() => {
          loadPosts();
        })
        .catch((error) => {
          alert("error!" + error);
        });
  };

  // Wrap loadComments in useCallback so it has a stable identity
  const loadComments = useCallback(() => {
    if (sessionStorage.getItem("token")) {
      const url = process.env.REACT_APP_API_PATH + "/posts?parentID=" + post.id;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      })
          .then((res) => res.json())
          .then((result) => {
            if (result) {
              setPostComments(result[0]);
              setComments(result[0].length);
            }
          })
          .catch((err) => {
            console.log("ERROR loading posts");
          });
    }
  }, [post.id]);

  useEffect(() => {
    loadComments();
  }, [showModal, loadComments]);

  const commentDisplay = () => {
    return (
        <div className="comment-block">
          {/* Tag button */}
          <div className="tag-block">
            <button
                value="tag post"
                onClick={() => setShowTags((prev) => !prev)}
            >
              tag post
            </button>
          </div>
          <div name="tagDiv" className={showHideTags()}>
            <img
                src={likeIcon}
                className="comment-icon"
                onClick={() => tagPost("like", post.id)}
                alt="Like Post"
            />
          </div>
          <p>({post.reactions.length})</p>
          {/* Comment indicator */}
          <div className="comment-indicator">
            <div className="comment-indicator-text">{comments} Comments</div>
            <img
                src={commentIcon}
                className="comment-icon"
                onClick={() => setShowModal((prev) => !prev)}
                alt="View Comments"
            />
          </div>
          {/* Comments and CommentForm */}
          <div className={showHideComments()}>
            <CommentForm
                parent={post.id}
                loadPosts={loadPosts}
                loadComments={loadComments}
            />
            <div className="posts">
              <div>
                {postComments.length > 0 &&
                    postComments.map((comment) => (
                        <Post
                            key={comment.id}
                            post={comment}
                            type="commentlist"
                            loadPosts={loadComments}
                        />
                    ))}
              </div>
            </div>
          </div>
        </div>
    );
  };

  const showDelete = () => {
    if (post.authorID === parseInt(sessionStorage.getItem("user"))) {
      return (
          <img
              src={helpIcon}
              className="sidenav-icon deleteIcon"
              alt="Delete Post"
              title="Delete Post"
              onClick={() => deletePost(post.id)}
          />
      );
    }
    return null;
  };

  const getUsername = (author) => {
    if (author.attributes) {
      return author.attributes.username;
    }
    return "";
  };

  return (
      <div key={post.id} className={[type, "postbody"].join(" ")}>
        <div className="deletePost">
          {getUsername(post.author)} ({post.created}) {showDelete()}
        </div>
        <br />
        {post.content}
        {commentDisplay()}
      </div>
  );
};

export default Post;
