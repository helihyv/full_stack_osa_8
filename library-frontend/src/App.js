import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql } from 'apollo-boost'
import { useQuery } from 'react-apollo-hooks' 
import { useMutation } from 'react-apollo-hooks';

const App = () => {
  const [page, setPage] = useState('authors')

  const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook (
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
    }
  }

`

const ALL_AUTHORS = gql`
{
  allAuthors {
    name,
    born,
    bookCount
  }
}
`  

const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
    }
  }
`

const EDIT_BORN = gql`
  mutation editBorn($name: String!, $born: Int!) {
    editAuthor (
      name: $name 
      born: $born
    ) {
      name
      born
    } 
  }
`


const resultOfAuthorQuery = useQuery(ALL_AUTHORS)

const resultOfBooksQuery = useQuery(ALL_BOOKS)


  const addBook = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS}, {query: ALL_AUTHORS}]
   })

  const editBorn = useMutation(EDIT_BORN, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors
        show={page === 'authors'}
        result = { resultOfAuthorQuery }
        editBorn = { editBorn}
      />

      <Books
        show={page === 'books'}
        result = { resultOfBooksQuery }
      />

      <NewBook
        show={page === 'add'}
        addBook={ addBook }
      />

    </div>
  )
}

export default App
