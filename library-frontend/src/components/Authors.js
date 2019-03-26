import React, { useState } from 'react'
import { gql } from 'apollo-boost'
import {useApolloClient } from 'react-apollo-hooks'
import { useQuery } from 'react-apollo-hooks' 

const ALL_AUTHORS = gql`
{
  allAuthors {
    name,
    born,
    bookCount
  }
}
`  

const Authors = (props) => {
  if (!props.show) {
    return null
  }

  const client = useApolloClient()

  const result = useQuery(ALL_AUTHORS)

  if (result.loading) {
    return <div>loading...</div>
  }

  const authors = result.data.allAuthors

  

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  )
}

export default Authors