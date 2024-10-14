import express from 'express';
import { errorHandler } from './middlewares/error.middleware';
import { UrlRoutes } from './routes/url.routes';
import { UserRoutes } from './routes/user.routes';
import appDataSource from './config/database';

export class App {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeDatabase();
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
