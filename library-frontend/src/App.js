import React, { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Recommend from "./components/Recommend.js";
import { gql } from "apollo-boost";
import {
  useQuery,
  useApolloClient,
  useMutation,
  useLazyQuery,
  useSubscription
} from "@apollo/react-hooks";

const App = () => {
  const [page, setPage] = useState("authors");

  const [token, setToken] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);
  const [genre, setGenre] = useState("");

  const client = useApolloClient();

  const CREATE_BOOK = gql`
    mutation createBook(
      $title: String!
      $author: String!
      $published: Int!
      $genres: [String!]!
    ) {
      addBook(
        title: $title
        author: $author
        published: $published
        genres: $genres
      ) {
        title
      }
    }
  `;

  const ALL_AUTHORS = gql`
    {
      allAuthors {
        name
        born
        bookCount
      }
    }
  `;

  const ALL_BOOKS = gql`
    query getBooks($genre: String) {
      allBooks(genre: $genre) {
        title
        author {
          name
        }
        published
      }
    }
  `;

  const GENRES_FROM_ALL_BOOKS = gql`
    {
      allBooks {
        genres
      }
    }
  `;

  const MY_FAVORITE_GENRE = gql`
    {
      me {
        favoriteGenre
      }
    }
  `;

  const EDIT_BORN = gql`
    mutation editBorn($name: String!, $born: Int!) {
      editAuthor(name: $name, born: $born) {
        name
        born
      }
    }
  `;

  const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        value
      }
    }
  `;

  const BOOK_ADDED = gql`
    subscription {
      bookAdded {
        title
        author {
          name
        }
        published
      }
    }
  `;
  const [getBooks, booksLoadingAndData] = useLazyQuery(ALL_BOOKS);

  const booksLoading = booksLoadingAndData.loading;
  const booksData = booksLoadingAndData.data;
  const [getFavoriteBooks, favoriteBooksLoadingAndData] = useLazyQuery(
    ALL_BOOKS
  );
  const favoriteBooksData = favoriteBooksLoadingAndData.data;
  const favoriteBooksLoading = favoriteBooksLoadingAndData.loading;

  const resultOfAuthorQuery = useQuery(ALL_AUTHORS);

  const genres = useQuery(GENRES_FROM_ALL_BOOKS);

  const fetchFavoriteBooks = () => {
    if (
      myFavoriteGenre &&
      myFavoriteGenre.data &&
      myFavoriteGenre.data.me &&
      myFavoriteGenre.data.me.favoriteGenre
    ) {
      getFavoriteBooks({
        variables: {
          genre: myFavoriteGenre.data.me.favoriteGenre
        }
      });
    }
  };

  const myFavoriteGenre = useQuery(MY_FAVORITE_GENRE, {
    onCompleted: fetchFavoriteBooks
  });

  useEffect(() => {
    setToken(localStorage.getItem("library-user-token", token));

    if (token) {
      myFavoriteGenre.refetch();
    }

    getBooks({
      variables: { genre }
    });
  }, [genre, token]);

  const [addBook] = useMutation(CREATE_BOOK, {
    refetchQueries: [
      { query: ALL_BOOKS },
      { query: ALL_AUTHORS },
      { query: GENRES_FROM_ALL_BOOKS }
    ]
  });

  const [editBorn] = useMutation(EDIT_BORN, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  });

  const [loginFunction] = useMutation(LOGIN);

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const book = subscriptionData.data.bookAdded;
      alert(`A new book has been added: ${book.title} by ${book.author.name}`);
    }
  });

  const errorNotification = () =>
    errorMessage && <div style={{ color: "red " }}>{errorMessage}</div>;

  const handleError = error => {
    setErrorMessage(error.graphQLErrors[0].message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  const logoutFunction = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    setPage("login");
  };

  return (
    <div>
      <div>{errorNotification()}</div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button
          onClick={() => setPage("add")}
          style={!token ? { display: "none" } : {}}
        >
          add book
        </button>
        <button
          style={token ? { display: "none" } : {}}
          onClick={() => setPage("login")}
        >
          login
        </button>
        <button
          style={!token ? { display: "none" } : {}}
          onClick={() => setPage("recommend")}
        >
          recommend
        </button>
        <button
          style={!token ? { display: "none" } : {}}
          onClick={() => logoutFunction(setToken, client.resetStore)}
        >
          logout
        </button>
      </div>

      <Authors
        show={page === "authors"}
        result={resultOfAuthorQuery}
        editBorn={editBorn}
        handleError={handleError}
      />

      <Books
        show={page === "books"}
        result={booksData}
        loading={booksLoading}
        genre={genre}
        genres={genres}
        setGenre={setGenre}
        getBooks={getBooks}
      />

      <NewBook
        show={page === "add"}
        addBook={addBook}
        handleError={handleError}
      />

      <Recommend
        show={page === "recommend"}
        favoriteBooks={favoriteBooksData}
        favoriteGenre={myFavoriteGenre}
        loading={favoriteBooksLoading}
        favoriteGenreLoading={myFavoriteGenre.loading}
        getFavoriteBooks={getFavoriteBooks}
      />

      <Login
        show={page === "login"}
        login={loginFunction}
        setToken={token => setToken(token)}
        handleError={handleError}
      />
    </div>
  );
};

export default App;
