// *************** IMPORT CORE ***************
require('dotenv').config();

// *************** IMPORT MODULE ***************
const UserTypeDefs = require('./user/user.typedefs');
const StudentTypeDefs = require('./student/student.typedefs');
const SchoolTypeDefs = require('./school/school.typedefs');
const UserResolvers = require('./user/user.resolvers');
const StudentResolvers = require('./student/student.resolvers');
const SchoolResolvers = require('./school/school.resolvers');
const CreateSchoolLoader = require('./school/school.loader');
const CreateStudentLoader = require('./student/student.loader');

// *************** IMPORT LIBRARY ***************
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');

// *************** Configuration
const app = express();
const port = process.env.PORT;
const baseTypeDefs = gql`
  scalar Date

  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

const server = new ApolloServer({
  // *************** Taking import from each type def
  typeDefs: [UserTypeDefs, StudentTypeDefs, SchoolTypeDefs, baseTypeDefs],

  // *************** Taking import from each resolver
  resolvers: [UserResolvers, StudentResolvers, SchoolResolvers],

  // *************** Taking import from each loaders
  context: () => ({
    loaders: {
      school: CreateSchoolLoader(),
      student: CreateStudentLoader(),
    },
  }),
});

// *************** Function to start server
/**
 * Initializes and starts the GraphQL server.
 *
 * - Starts the Apollo Server.
 * - Applies middleware to the Express app.
 * - Connects to MongoDB.
 * - Sets up a basic route at '/'.
 * - Listens on the specified port.
 *
 * @async
 * @function StartServer
 * @returns {Promise<void>} - A Promise that resolves when the server is successfully started.
 * @throws {Error} - Logs error if the server fails to start.
 */
async function StartServer() {
  try {
    // *************** running Apollo server asynchronous
    await server.start();

    // *************** connect apollo server to express as middleware
    server.applyMiddleware({ app, path: '/graphql' });

    // *************** connect mongoose to mongoDB
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // *************** message if the connection is success
    console.log('✅ MongoDB connected');

    // *************** adding endpoint to testing the server
    app.get('/', (req, res) => {
      res.send('Server is running');
    });

    // *************** adding message if the server running
    app.listen(port, () => {
      console.log(
        `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
      );
    });
  } catch (error) {
    // *************** showing error message if cannot connect to the server
    console.error('Error starting server:', error);
  }
}

// *************** calling function to start the server
StartServer();
