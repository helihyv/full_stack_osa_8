import React from "react";
import GenreChooser from "./GenreChooser";
import BookTable from "./BookTable";

const Books = props => {
  if (!props.show) {
    return null;
  }

  if (props.loading) {
    return <div>loading...</div>;
  }

  const books =
    props.result && props.result.allBooks ? props.result.allBooks : [];

  return (
    <div>
      <h2>books</h2>

      {props.genre ? <p> in genre {props.genre}</p> : null}

      <BookTable books={books} />
      <GenreChooser genres={props.genres} setGenre={props.setGenre} />
    </div>
  );
};

export default Books;
