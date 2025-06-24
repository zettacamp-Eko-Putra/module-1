// *************** IMPORT LIBRARY ***************
const { ApolloServer } = require('apollo-server-express');

// *************** IMPORT MODULE ***************
const TypeDefs = require('./typedefs.js');
const Resolvers = require('./resolvers.js');

// *************** IMPORT UTILITIES ***************
const DataLoaders = require(`./loaders.js`);

/**
 * Creates and configures a new instance of ApolloServer.
 * - Loads GraphQL type definitions, resolvers, and data loaders.
 * - Sets up the context for each request, injecting DataLoaders for batching and caching.
 *
 * @function GetApolloServer
 * @returns {ApolloServer} - A configured instance of ApolloServer ready to be started.
 */
function CreateApolloServer() {
  return new ApolloServer({
    // *************** Taking import from each type def
    typeDefs: TypeDefs,

    // *************** Taking import from each resolver
    resolvers: Resolvers,

    // *************** Taking import from each loaders
    context: () => ({
      loaders: DataLoaders(),
    }),
  });
}

// *************** EXPORT MODULE ***************
module.exports = CreateApolloServer;
