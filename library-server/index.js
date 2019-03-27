const { ApolloServer, gql } = require('apollo-server')
const uuid = require('uuid/v1')
const mongoose = require('mongoose')
const config = require('./utils/config')
const Book = require('./models/book')
const Author = require('./models/author')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true}).then(() => {
  console.log('connected to mongoDB')
})
.catch((error) => {
  console.log('error connecting to MongoDB:', error.message)
})

const typeDefs = gql`

  type Book {

    title: String!
    published: Int!
    author: String!
    id: ID!
    genres: [String!]!

  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      born: Int!
    ):Author
  }
`

const resolvers = {
  Query: {

    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let booksToList
      if (args.author) {

        
        booksToList = books.filter((book) => book.author === args.author)
      } else {
        booksToList = books
      }
      
      if (args.genre) {
        booksToList = booksToList.filter((book) => book.genres.includes(args.genre))
      }

      return booksToList
    },
    allAuthors: () => authors,
    },

  Author: {
    bookCount: (root) => books.filter((book) => book.author === root.name).length  
  },
  
  Mutation: {
    addBook: (root, args) => {
      const book = {...args, id: uuid()}
      books = books.concat(book)

      if (!authors.find((author) => author.name === args.author)) {
        const newAuthor = {
          name: args.author,
          id: uuid()
        }
        authors = authors.concat(newAuthor)
      }

      return book

    },

    editAuthor: (root, args) => {
      const authorToEdit = authors.find((author) => author.name === args.name)
      if (!authorToEdit) {
        return null
      }
      authorToEdit.born = args.born 
      return authorToEdit
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})