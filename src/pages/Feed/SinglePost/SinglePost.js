import React, { Component } from "react";
import openSocket from "socket.io-client";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { IconContext } from "react-icons";

import Image from "../../../components/Image/Image";
import Button from "../../../components/Button/Button";
import Comment from "../../../components/Comment/Comment";
import FeedEdit from "../../../components/Feed/FeedEdit/FeedEdit";
import ErrorHandler from "../../../components/ErrorHandler/ErrorHandler";
import "./SinglePost.css";

class SinglePost extends Component {
  _isMounted = false;
  state = {
    postId: "",
    title: "",
    author: "",
    authorId: "",
    date: "",
    image: "",
    imageUrl: "",
    content: "",
    comment: "",
    updatedAt: "",
    comments: [],
    likers: [],
    isEdit: false,
    editComment: null,
    isEditing: false,
    editPost: null,
    editLoading: false,
  };

  componentDidMount() {
    this._isMounted = true;
    this.setState({ postId: this.props.match.params.postId }, () => {
      fetch(`https://sm-backend.onrender.com/feed/post/${this.state.postId}`, {
        headers: {
          Authorization: "Bearer " + this.props.token,
        },
      })
        .then((res) => {
          if (res.status !== 200) {
            throw new Error("Failed to fetch post");
          }
          return res.json();
        })
        .then((resData) => {
          this.setState({
            title: resData.post.title,
            author: resData.post.creator.name,
            authorId: resData.post.creator._id,
            image: "https://sm-backend.onrender.com/" + resData.post.imageUrl,
            imageUrl: resData.post.imageUrl,
            date: new Date(resData.post.createdAt).toLocaleDateString("en-US"),
            updatedAt: new Date(resData.post.updatedAt).toLocaleDateString(
              "en-US"
            ),
            content: resData.post.content,
            comments: resData.comments,
            likers: resData.likers,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    });
    const socket = openSocket("https://sm-backend.onrender.com");
    socket.on("comments", (data) => {
      if (data.action === "create") {
        this.addComment(data.comment);
      } else if (data.action === "update") {
        this.updateComment(data.comment);
      } else if (data.action === "delete") {
        this.deleteComment(data.comment);
      }
    });
    socket.on("post", (data) => {
      if (data.action === "like") {
        this.editLike(data.likers);
      } else if (data.action === "update") {
        this.editPost(data.post);
      }
    });
  }

  editPost = (postData) => {
    this.setState({
      title: postData.title,
      image: "https://sm-backend.onrender.com/" + postData.imageUrl,
      imageUrl: postData.imageUrl,
      content: postData.content,
      updatedAt: new Date(postData.updatedAt).toLocaleDateString("en-US"),
    });
  };

  startEditPostHandler = () => {
    this.setState((prevState) => {
      const loadedPost = {
        title: prevState.title,
        imagePath: prevState.imageUrl,
        content: prevState.content,
      };

      return {
        isEditing: true,
        editPost: loadedPost,
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = (postData) => {
    this.setState({
      editLoading: true,
    });
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("content", postData.content);
    formData.append("image", postData.image);

    fetch(
      `https://sm-backend.onrender.com/feed/post/${this.state.postId}?location=post`,
      {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: "Bearer " + this.props.token,
        },
      }
    )
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Creating or editing a post failed!");
        }
        return res.json();
      })
      .then((resData) => {
        this.setState((prevState) => {
          return {
            isEditing: false,
            editPost: null,
            editLoading: false,
          };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err,
        });
      });
  };

  editLike = (newLikers) => {
    this.setState({ likers: newLikers });
  };

  addComment = (comment) => {
    this.setState((prevState) => {
      const updatedComments = [...prevState.comments];
      updatedComments.unshift(comment);
      return {
        comments: updatedComments,
      };
    });
  };

  updateComment = (comment) => {
    this.setState((prevState) => {
      const updatedComments = [...prevState.comments];
      const updatedCommentIndex = updatedComments.findIndex(
        (p) => p._id === comment._id
      );
      if (updatedCommentIndex > -1) {
        updatedComments[updatedCommentIndex] = comment;
      }
      return {
        comments: updatedComments,
      };
    });
  };

  deleteComment = (comment) => {
    this.setState((prevState) => {
      const updatedComments = [...prevState.comments];
      const remainingComments = updatedComments.filter(
        (p) => p._id !== comment
      );
      return {
        comments: remainingComments,
      };
    });
  };

  postLikeHandler = async () => {
    let flag;
    this.setState(
      (prevState) => {
        const currentLikers = [...prevState.likers];
        const ind = currentLikers.findIndex(
          (currentLiker) => currentLiker.id === this.props.userId
        );
        if (ind > -1) {
          flag = "unlike";
          currentLikers.splice(ind, 1);
        } else {
          flag = "like";
          currentLikers.push(this.props.userId);
        }
        return {
          likers: currentLikers,
        };
      },
      () => {
        fetch(
          `https://sm-backend.onrender.com/feed/post/like/${this.state.postId}?location=post&flag=${flag}`,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + this.props.token,
            },
          }
        )
          .then((res) => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error("Updating a like failed!");
            }
            return res.json();
          })
          .then((resData) => {
            console.log(resData);
          })
          .catch((err) => {
            console.log(err);
            this.setState({ error: err });
          });
      }
    );
  };

  newCommentHandler = () => {
    let url = `https://sm-backend.onrender.com/feed/post/comments/${this.state.postId}`;
    let method = "POST";
    if (this.state.isEdit) {
      url = `https://sm-backend.onrender.com/feed/post/comments/${this.state.editComment._id}`;
      method = "PUT";
    }
    fetch(url, {
      method,
      body: JSON.stringify({ comment: this.state.comment }),
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Creating or editing a comment failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        this.setState(() => {
          return {
            isEdit: false,
            editComment: null,
            comment: "",
          };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isEdit: false,
          editComment: null,
          comment: "",
          error: err,
        });
      });
  };

  startCommentEditHandler = (commentId) => {
    this.setState((prevState) => {
      const loadedComment = {
        ...prevState.comments.find((comment) => comment._id === commentId),
      };

      return {
        isEdit: true,
        comment: loadedComment.comment,
        editComment: loadedComment,
      };
    });
  };

  cancelCommentEditHandler = () => {
    this.setState({ isEdit: false, editComment: null, comment: "" });
  };

  deleteCommentHandler = (commentId) => {
    fetch("https://sm-backend.onrender.com/feed/post/comments/" + commentId, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + this.props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Deleting a comment failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
      })
      .catch((err) => {
        console.log(err);
        this.setState({ error: err });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="single-post">
          <h1>{this.state.title}</h1>
          <h2>
            Created by {this.state.author} on {this.state.date}
          </h2>
          {this.state.updatedAt && <h2>Edited on {this.state.updatedAt}</h2>}
          <div className="single-post__image">
            <Image contain imageUrl={this.state.image} />
          </div>
          <p>{this.state.content}</p>
        </section>
        <div className="single-post-actions">
          <Button mode="flat" onClick={this.postLikeHandler}>
            <IconContext.Provider value={{ color: "#3b0062" }}>
              {this.state.likers.findIndex(
                (liker) => liker.id === this.props.userId
              ) > -1 ? (
                <AiFillLike />
              ) : (
                <AiOutlineLike />
              )}
            </IconContext.Provider>
          </Button>
          {this.state.likers.length > 0 && <>{this.state.likers.length}</>}
          {this.props.userId === this.state.authorId && (
            <Button mode="flat" onClick={this.startEditPostHandler}>
              Edit
            </Button>
          )}
          {this.state.likers.length > 0 && (
            <div className="likers-box" key="liker1">
              <h2 key="liker2">Liked By</h2>
              <div key="liker3">
                {this.state.likers.map((liker) => (
                  <p key={liker.id}>{liker.name}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        <section>
          <textarea
            className="comment-area"
            placeholder="Add Comment"
            rows="5"
            id="comment"
            name="comment"
            value={this.state.comment}
            onChange={(Event) => this.setState({ comment: Event.target.value })}
          ></textarea>
          <section className="button-placement">
            <Button
              mode="raised"
              design="accent"
              onClick={this.newCommentHandler}
            >
              {this.state.isEdit ? "Edit Comment" : "Add Comment"}
            </Button>
            {this.state.isEdit && (
              <Button
                design="danger"
                mode="flat"
                onClick={this.cancelCommentEditHandler}
              >
                Cancel
              </Button>
            )}
          </section>
          {this.state.comments.length > 0 ? (
            <>
              {this.state.comments.map((comment) => (
                <Comment
                  key={comment._id}
                  id={comment._id}
                  author={comment.user.name}
                  date={new Date(
                    comment.updatedAt !== comment.createdAt
                      ? comment.updatedAt
                      : comment.createdAt
                  ).toLocaleDateString("en-US")}
                  content={comment.comment}
                  editedComment={comment.updatedAt !== comment.createdAt}
                  isEditComment={
                    this.props.userId === comment.user.id.toString()
                      ? true
                      : false
                  }
                  onStartEdit={this.startCommentEditHandler.bind(
                    this,
                    comment._id
                  )}
                  onDelete={this.deleteCommentHandler.bind(this, comment._id)}
                />
              ))}
            </>
          ) : (
            <p style={{ textAlign: "center" }}>No comments.</p>
          )}
        </section>
      </>
    );
  }
}

export default SinglePost;
