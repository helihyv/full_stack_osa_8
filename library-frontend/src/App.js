import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import { gql } from 'apollo-boost'
import { useQuery } from 'react-apollo-hooks' 
import { useMutation } from 'react-apollo-hooks';
import Logout from './components/Logout';

const App = () => {
  const [page, setPage] = useState('authors')

  const [token, setToken] =useState(null)

  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    setToken(localStorage.getItem('library-user-token', token)) 
  }, [])


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

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
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

  const loginFunction = useMutation(LOGIN)

  const errorNotification = () => errorMessage &&
    <div style={{ color: 'red '}}>
      { errorMessage }
    </div>

  const handleError = (error) => {
    setErrorMessage(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }
   
  return (
    <div>
      <div>
        { errorNotification() }
      </div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button 
          onClick={() => setPage('add')}
          style = {!token ?  { display: 'none' } : {} }
        >add book</button>
        <button 
          style = {token ?  { display: 'none' } : {} }
          onClick={() =>setPage('login')}
        >login</button>
        <button
          style = {!token ?  { display: 'none' } : {}}
          onClick={() => setPage('logout')}
        >logout</button>
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

      <Login
        show={ page === 'login'}
        login={loginFunction}
        setToken={(token => setToken(token))}
        handleError={handleError}
      />

      <Logout
        show ={ page === 'logout'}
        setToken= {(token => setToken(token))}

      />

    </div>
  )
}

export default App
