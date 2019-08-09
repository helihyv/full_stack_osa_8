import React, { useEffect } from "react";
import BookTable from "./BookTable";

const Recommend = ({
  favoriteGenre,
  favoriteGenreLoading,
  favoriteBooks,
  favoriteBooksLoading,
  getFavoriteBooks,
  show
}) => {
  if (!show) {
    return null;
  }

  if (favoriteBooksLoading || favoriteGenreLoading) {
    return <div>Loading...</div>;
  }

  console.log(favoriteGenre.data);

  const genre =
    !favoriteGenre ||
    !favoriteGenre.data ||
    favoriteGenre.data.me ||
    favoriteGenre.data.me.favoriteGenre
      ? favoriteGenre.data.me.favoriteGenre
      : null;

  if (!genre) {
    return <div>you have no favourite genre set</div>;
  }

  const books =
    favoriteBooks && favoriteBooks.allBooks ? favoriteBooks.allBooks : [];
  return (
    <div>
      <h2>recommendations</h2>

      <p>books in your favorite genre {genre}</p>

      <BookTable books={books} />
    </div>
  );
};

export default Recommend;
