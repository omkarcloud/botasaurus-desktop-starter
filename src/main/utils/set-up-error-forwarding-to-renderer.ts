import { MainHandler } from './main-handler';

const sendErrorToRenderer = (error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack =
    error instanceof Error ? error.stack : 'No stack available';

  MainHandler.log({
    error: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  });
};

export default function setUpErrorForwardingToRenderer() {

    const overrideConsoleError = () => {
      // Store the original console.error function
      const originalConsoleError = console.error;
      // @ts-ignore
      console.orignal_error  = console.error
      // Override console.error to forward errors to the Renderer
      console.error = (...args) => {
        const error = args[0];
        if (error instanceof Error) {
          sendErrorToRenderer(error);
        } else {
          sendErrorToRenderer(error);
        }
        originalConsoleError.apply(console, args);
      };
    };
  
    overrideConsoleError();
  
    // Catch synchronous errors (unhandled exceptions)
    process.on('uncaughtException', (error) => {
      sendErrorToRenderer(error);
    });
  
    // Catch asynchronous errors (unhandled promise rejections)
    process.on('unhandledRejection', (reason, promise) => {
      if (reason instanceof Error) {
        sendErrorToRenderer(reason);
      } else {
        sendErrorToRenderer(
          new Error(`Unhandled Rejection: ${JSON.stringify(reason)}`),
        );
      }
    });
  }
  