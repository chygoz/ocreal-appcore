export interface SendEmail {
  email: string;
  subject: string;
  template?: string;
  body: any;
}
