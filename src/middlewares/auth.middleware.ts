import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { ServiceAccount } from '../Interfaces/serviceAccount.interface';

type FirebaseAdmin = admin.app.App;
type Credential = { credential: admin.credential.Credential };

class AuthMiddleware {
  firebase: FirebaseAdmin;
  private readonly serviceAccount: ServiceAccount;

  private firebaseConfig: Credential;

  constructor() {
    this.serviceAccount = {
      type: process.env.FIREBASE_TYPE as string,
      projectId: process.env.FIREBASE_PROJECT_ID as string,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID as string,
      privateKey: process.env.FIREBASE_PRIVATE_KEY as string,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
      clientId: process.env.FIREBASE_CLIENT_ID as string,
      authUri: process.env.FIREBASE_AUTH_URI as string,
      tokenUri: process.env.FIREBASE_TOKEN_URI as string,
      authProviderX509CertUrl: process.env
        .FIREBASE_AUTH_PROVIDER_X509_CERT_URL as string,
      clientC509CertUrl: process.env.FIREBASE_CLIENT_x509_CERT_URL as string,
    };

    this.firebaseConfig = {
      credential: admin.credential.cert(this.serviceAccount),
    };

    if (!admin.apps.length) {
      this.firebase = admin.initializeApp(this.firebaseConfig);
    } else {
      this.firebase = admin.app();
    }
  }

  async authenticate(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    const token = authorization;

    if (!!token) {
      try {
        await this.firebase.auth().verifyIdToken(token.replace('Bearer ', ''));
        next();
      } catch (error) {
        this.accessDenied(req.url, res);
      }
    } else {
      this.accessDenied(req.url, res);
    }
  }

  private accessDenied(url: string, res: Response) {
    res.status(401).json({
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: url,
      message: 'Access Denied',
    });
  }
}

export default AuthMiddleware;
