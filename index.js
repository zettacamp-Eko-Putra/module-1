// *************** IMPORT CORE ***************
const CreateExpressApp = require(`./core/express.js`);
const CreateApolloServer = require(`./core/apollo.js`);
const ConnectToMongoDB = require(`./core/database.js`);
const { PORT } = require('./core/config');

// *************** Function to Initialize server
/**
 * Initializes and starts the Express and Apollo GraphQL servers.
 * - Connects to the MongoDB database.
 * - Starts the Apollo Server and applies its middleware to the Express app.
 * - Sets up a basic health check route (`GET /`) that returns a simple status message.
 * - Starts the Express HTTP server on the specified port.
 *
 * @async
 * @function InitializeServer
 * @returns {Promise<void>} - A Promise that resolves when the server is successfully running.
 * @throws {Error} Logs any errors encountered during server initialization.
 */
async function InitializeServer() {
  // *************** Create Express app instance
  const app = CreateExpressApp();

  // *************** Create Apollo Server instance
  const server = CreateApolloServer();
  try {
    // *************** Connect to Mongo DB
    await ConnectToMongoDB();

    // *************** Apply Apollo middleware to Express app
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    // *************** Health check route for basic server status
    app.get('/', (req, res) => res.send('Server is running'));

    // *************** Start Express server and listen on PORT
    app.listen(PORT, () => {
      console.log(
        `Server running`
      );
    });
  } catch (error) {
    // *************** Handle and log any errors during initialization
    console.error('Error starting server:', error);
  }
}

// *************** calling function to Initialize the server
InitializeServer();
