import React, { useState } from 'react'
import Select from 'react-select'

const Authors = (props) => {

const [selectedName, setSelectedName] = useState(null)
const [born, setBorn] = useState('')


  if (!props.show) {
    return null
  }



  if (props.result.loading) {
    return <div>loading...</div>
  }

  const authors = props.result.data.allAuthors
  const options = authors.map ((author) => {
    return { 
      value: author.name,
      label: author.name
    }
    })
 
 
  

  const submit = async (e) => {
    e.preventDefault()

       await props.editBorn({
        variables: {
          name: selectedName.value,
          born: parseInt(born)
        }
      })
    
      setBorn('')
      setSelectedName(null)
  }

  const onNameChange =  (value, {action, removedValue}) => {
    setSelectedName(value)
  }

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

      <h3>Set birthyear</h3>
      <form onSubmit = {submit}>
      <div>
        <Select 
          value = { selectedName }
          onChange = { onNameChange }
          options = { options } 
        />
      </div>
      <div>
        born
        <input
          value = { born }
          onChange = {({target}) => setBorn(target.value) }
        />
      </div>
      <div>
            <button type = "submit" disabled = {!selectedName || !parseInt(born) } >update author</button>
      </div>

      </form>

    </div>
  )
}

export default Authors