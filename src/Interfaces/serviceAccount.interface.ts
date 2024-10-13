export interface ServiceAccount {
  type: string;
  projectId: string;
  privateKeyId: string;
  privateKey: string;
  clientEmail: string;
  clientId: string;
  authUri: string;
  tokenUri: string;
  authProviderX509CertUrl: string;
  clientC509CertUrl: string;
}
