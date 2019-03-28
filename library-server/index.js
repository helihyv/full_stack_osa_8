const { ApolloServer, UserInputError, gql } = require('apollo-server')
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
    allBooks: async (root, args) => {
      let bookFilter = {}
      if (args.author) {
        authorObject = await Author.findOne({name: args.author})
        bookFilter.author = authorObject._id
      }
     
      if (args.genre) {
        bookFilter.genres = args.genre 
      }
  
      return Book.find(bookFilter)
    },
    allAuthors: () => Author.find(),
    },

  Author: {
    bookCount: async (root) => {
      const authorObject = await Author.findOne({name: root.name})
      return Book.collection.countDocuments({author: authorObject._id})  
    }
  },

  Book: {
    author: (root) => Author.findOne({_id: root.author})
    
  },
  
  Mutation: {
    addBook: async (root, args) => {

    let author = await Author.findOne({ name: args.author})

   
      if (!author) { 
        author = new Author({
          name: args.author
        })
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }


      const book = new Book({...args, author: author._id})
      
      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
        return book
   
    },

    editAuthor: async (root, args) => {
      const authorToEdit = await Author.findOne({name: args.name })
      if (!authorToEdit) {
        return null
      }
      authorToEdit.born = args.born 

      try {
        await authorToEdit.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
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