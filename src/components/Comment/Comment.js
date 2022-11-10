import React from "react";

import Button from "../Button/Button";
import "./Comment.css";

const comment = (props) => {
  return (
    <article className="comment">
      <header className="comment__header">
        <h3 className="comment__meta">
          {props.editedComment ? "Edited" : "Posted"} by {props.author} on{" "}
          {props.date}
        </h3>
      </header>
      <div className="comment__content">{props.content}</div>
      <div className="comment__actions">
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

export default comment;
