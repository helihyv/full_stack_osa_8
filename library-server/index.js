const {
  ApolloServer,
  UserInputError,
  AuthenticationError,
  gql,
  PubSub
} = require("apollo-server");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("./utils/config");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");
const pubsub = new PubSub();

if (!config.MONGODB_URI) {
  console.log(
    "No mongo database URL given, set it with the environment variable MONGODB_URI"
  );
  return;
}
if (!config.JWT_SECRET) {
  console.log(
    "No JWT secret phrase given, set it with the environment variable JWT_SECRET"
  );
  return;
}

console.log("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("connected to mongoDB");
  })
  .catch(error => {
    console.log("error connecting to MongoDB:", error.message);
  });

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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book

    editAuthor(name: String!, born: Int!): Author

    createUser(username: String!, favoriteGenre: String!): User

    login(username: String!, password: String!): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`;

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let bookFilter = {};
      if (args.author) {
        authorObject = await Author.findOne({ name: args.author });
        bookFilter.author = authorObject._id;
      }

      if (args.genre) {
        bookFilter.genres = args.genre;
      }

      return Book.find(bookFilter);
    },
    allAuthors: () => Author.find(),
    me: (root, args, context) => {
      return context.currentUser;
    }
  },

  Author: {
    bookCount: async root => {
      const authorObject = await Author.findOne({ name: root.name });
      return Book.collection.countDocuments({ author: authorObject._id });
    }
  },

  Book: {
    author: root => Author.findOne({ _id: root.author })
  },

  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({
          name: args.author
        });
        try {
          await author.save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          });
        }
      }

      const book = new Book({ ...args, author: author._id });

      try {
        await book.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        });
      }

      pubsub.publish("BOOK_ADDED", { bookAdded: book });

      return book;
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      const authorToEdit = await Author.findOne({ name: args.name });
      if (!authorToEdit) {
        return null;
      }
      authorToEdit.born = args.born;

      try {
        await authorToEdit.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        });
      }
      return authorToEdit;
    },

    createUser: (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre
      });

      return user.save().catch(error => {
        throw new UserInputError(error.message, {
          invalidArgs: args
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secred") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id
      };

      return { value: jwt.sign(userForToken, config.JWT_SECRET) };
    }
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"])
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), config.JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  }
});

server.listen().then(({ url, subscriptionsPath }) => {
  console.log(`Server ready at ${url}`);
  console.log(`Subscriptions ready at ${subscriptionsPath}`);
});
