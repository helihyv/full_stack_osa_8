import React from "react";
const GenreChooser = ({ genres, setGenre }) => {
  const uniqueGenresSet = new Set();
  if (genres && genres.data && genres.data.allBooks) {
    genres.data.allBooks.forEach(book =>
      book.genres.forEach(genre => uniqueGenresSet.add(genre))
    );
  }

  const uniqueGenres = Array.from(uniqueGenresSet);
  return (
    <div>
      {uniqueGenres.map(genre => (
        <button key={genre} onClick={() => setGenre(genre)}>
          {genre}
        </button>
      ))}
      <button key="All genres" onClick={() => setGenre("")}>
        All genres
      </button>
    </div>
  );
};

export default GenreChooser;
