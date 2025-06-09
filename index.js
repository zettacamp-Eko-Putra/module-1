// *************** IMPORT CORE ***************
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const { userType, UserQuery, UserMutation } = require('./user/User.typedef');
const { studentType, StudentQuery, StudentMutation } = require('./student/Student.typedef');
const { schoolType, SchoolQuery, addressType } = require('./school/School.typedef');
const { userResolvers } = require('./user/user.resolver');
const { studentResolvers } = require('./student/student.resolver');
const { schoolResolvers } = require('./school/school.resolver');

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
  ${studentType}
  ${StudentQuery}
  ${StudentMutation}
  ${schoolType}
  ${SchoolQuery}
  ${addressType}

`;

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...studentResolvers.Query,
    ...schoolResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...studentResolvers.Mutation
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  try {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    await mongoose.connect('mongodb://localhost:27017/module', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    app.get('/', (req, res) => {
      res.send('Server is running');
    });

    app.listen(port, () => {
      console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();
