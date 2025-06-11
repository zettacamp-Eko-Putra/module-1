// *************** IMPORT MODULE *************** 
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const { userType, UserQuery, UserMutation } = require('./user/user.typedefs');
const { studentType, StudentQuery, StudentMutation } = require('./student/student.typedefs');
const { schoolType, SchoolQuery, addressType, SchoolMutation } = require('./school/school.typedefs');
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
  ${studentType}
  ${StudentQuery}
  ${StudentMutation}
  ${schoolType}
  ${SchoolQuery}
  ${addressType}
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
