import React from "react";
import BookTable from "./BookTable";

const Recommend = ({
  favoriteGenre,
  favoriteGenreLoading,
  favoriteBooks,
  favoriteBooksLoading,
  getFavoriteBooks,
  getMyFavoriteGenre,
  token,
  show
}) => {
  if (!show) {
    return null;
  }

  if (favoriteBooksLoading || favoriteGenreLoading) {
    return <div>Loading...</div>;
  }

  const genre =
    favoriteGenre &&
    favoriteGenre.data &&
    favoriteGenre.data.me &&
    favoriteGenre.data.me.favoriteGenre
      ? favoriteGenre.data.me.favoriteGenre
      : null;

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
