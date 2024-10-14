import express from 'express';
import { errorHandler } from './middlewares/error.middleware';
import { UrlRoutes } from './routes/url.routes';
import { UserRoutes } from './routes/user.routes';
import appDataSource from './config/database';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

export class App {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(errorHandler);
  }

  private initializeRoutes(): void {
    const urlRoutes = new UrlRoutes();
    const userRoutes = new UserRoutes();

    this.app.use('/', urlRoutes.router);
    this.app.use('/user', userRoutes.router);
  }

  private initializeSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'My API',
          version: '1.0.0',
          description: 'API documentation',
        },
      },
      apis: ['./src/routes/*.ts'],
    };

    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    this.app.use(
      '/swagger/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocs)
    );
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await appDataSource.sync();
      console.log('Data Source has been initialized!');
    } catch (err) {
      console.error('Error during Data Source initialization:', err);
      process.exit(1);
    }
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}

const app = new App();
app.listen(3000);
