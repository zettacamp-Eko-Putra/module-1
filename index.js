// *************** IMPORT MODULE *************** 
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const { userType, UserQuery, UserMutation, userAddressType } = require('./user/user.typedefs');
const { studentType, StudentQuery, StudentMutation, studentAddressType } = require('./student/student.typedefs');
const { schoolType, SchoolQuery, SchoolAddressType, SchoolMutation } = require('./school/school.typedefs');
const { userResolvers } = require('./user/user.resolvers');
const { studentResolvers } = require('./student/student.resolvers');
const { schoolResolvers } = require('./school/school.resolvers');
const CreateSchoolLoader = require('./school/school.loader');
const CreateStudentLoader = require('./student/student.loader')

// *************** Configuration ***************
const app = express();
const port = 3000;
const typeDefs = gql`
  scalar Date

  type Query {
    _empty: String 
  }
  type Mutation {
    _empty: String
  }
  ${userType}
  ${UserQuery}
  ${UserMutation}
  ${userAddressType}
  ${studentType}
  ${StudentQuery}
  ${StudentMutation}
  ${studentAddressType}
  ${schoolType}
  ${SchoolQuery}
  ${SchoolAddressType}
  ${SchoolMutation}

`;

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...studentResolvers.Query,
    ...schoolResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...studentResolvers.Mutation,
    ...schoolResolvers.Mutation
  },
  Student: studentResolvers.Student,
  School: schoolResolvers.School
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () =>({
    loaders: {
      school: CreateSchoolLoader(),
      student: CreateStudentLoader()
    }
  })
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
    // running Apollo server asynchronous 
    await server.start();

    // connect apollo server to express as middleware
    server.applyMiddleware({ app, path: '/graphql' });

    // connect mongoose to mongoDB
    await mongoose.connect('mongodb://localhost:27017/module', 
      {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // message if the connection is success
    console.log('✅ MongoDB connected');

    // adding endpoint to testing the server
    app.get('/', (req, res) => {
      res.send('Server is running');
    });

    // adding message if the server running 
    app.listen(port, () => {
      console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
    });
  } 
  // showing error message if cannot connect to the server
  catch (error) {
    console.error('Error starting server:', error);
  }
}

// calling function to start the server
StartServer();
