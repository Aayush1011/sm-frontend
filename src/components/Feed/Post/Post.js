import React from "react";
import { AiOutlineLike, AiFillLike, AiOutlineComment } from "react-icons/ai";
import { IconContext } from "react-icons";

import Button from "../../Button/Button";
import Image from "../../../components/Image/Image";
import "./Post.css";

const post = (props) => {
  const likeButton = props.isLike ? <AiFillLike /> : <AiOutlineLike />;
  return (
    <article className="post">
      <header className="post__header">
        <h3 className="post__meta">
          Posted by {props.author} on {props.date}
        </h3>
        {!props.updated && (
          <h3 className="post__meta">Edited on {props.editedDate}</h3>
        )}
        <h1 className="post__title">{props.title}</h1>
      </header>
      <div className="post__image">
        <Image imageUrl={"http://localhost:8080/" + props.image} contain />
      </div>
      <div className="post__content">{props.content}</div>
      <div className="post__actions">
        <Button mode="flat" onClick={props.onLike}>
          <IconContext.Provider value={{ color: "#3b0062" }}>
            {likeButton}
          </IconContext.Provider>
        </Button>
        {props.likes > 0 && (
          <>
            <Button mode="flat" link={props.id}>
              <>{props.likes}</>
            </Button>
          </>
        )}
        <Button mode="flat" link={props.id}>
          <IconContext.Provider value={{ color: "#3b0062" }}>
            <AiOutlineComment />
          </IconContext.Provider>
        </Button>
        {props.comments > 0 && (
          <>
            <Button mode="flat" link={props.id}>
              <>{props.comments}</>
            </Button>
          </>
        )}
        {props.isEditComment && (
          <>
            <Button mode="flat" onClick={props.onStartEdit}>
              Edit
            </Button>
            <Button mode="flat" design="danger" onClick={props.onDelete}>
              Delete
            </Button>
          </>
        )}
      </div>
    </article>
  );
};

export default post;
