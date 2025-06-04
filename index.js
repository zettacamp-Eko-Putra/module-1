// *************** IMPORT CORE ***************
import express from 'express';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { startStandaloneServer } from '@apollo/server/standalone';
import { userType } from './user/type/User.type.js';
import { studentType } from './student/type/Student.type.js';
import { schoolType } from './school/type/School.type.js';
import  { userResolvers } from './user/resolver/user.resolver.js'
import  { studentResolvers } from './student/resolver/student.resolver.js'
import  { schoolResolvers } from './school/resolver/school.resolver.js'


// *************** Configuration ***************
const app = express();
const port = 3000;
export const typeDefs = gql`
  scalar Date

  ${userType}
  ${studentType}
  ${schoolType}

  type Query {
    users: [User]
    user(id: ID!): User
    students: [Student]
    student(id: ID!): Student
    schools: [School]
    school(id: ID!): School
  }
`;

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...studentResolvers.Query,
    ...schoolResolvers.Query,
  }
}
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);

// *************** Connection express ***************
app.get('/', (req, res) => {
  res.send('Server is running');
});


// *************** START: Server listening ***************
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// *************** END: server listening ***************


// *************** Connection to mongodb ***************
mongoose.connect('mongodb://localhost:27017/module')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));
