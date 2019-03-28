const { ApolloServer, gql } = require('apollo-server')
const uuid = require('uuid/v1')
const mongoose = require('mongoose')
const config = require('./utils/config')
const Book = require('./models/book')
const Author = require('./models/author')

mongoose.connect(
  config.MONGODB_URI, 
  { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
  console.log('connected to mongoDB')
})
.catch((error) => {
  console.log('error connecting to MongoDB:', error.message)
})

const typeDefs = gql`

  type Book {

    title: String!
    published: Int!
    author: Author!
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

    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
    /*  let booksToList
      if (args.author) {

        
        booksToList = books.filter((book) => book.author === args.author)
      } else {
        booksToList = books
      }
      
      if (args.genre) {
        booksToList = booksToList.filter((book) => book.genres.includes(args.genre))
      }
    */
      return Book.find({})
    },
    allAuthors: () => Author.find(),
    },

  Author: {
    bookCount: (root) => books.filter((book) => book.author === root.name).length  
  },
  
  Mutation: {
    addBook: async (root, args) => {

    let author = await Author.findOne({ name: args.author})

    console.log(author)

      if (!author) { 
        author = new Author({
          name: args.author
        })
        author.save()
      }


    const book = new Book({...args, author: author._id})
    console.log(book)
    return book.save()

    
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