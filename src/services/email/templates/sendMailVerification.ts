export const accountVerification = (verification_code: string): string => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Verification Code</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f7f7f7;
      }
  
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 0;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
  
      .logo-section {
        padding: 20px 40px;
      }
  
      .logo-section img {
        height: 24px;
        width: auto;
      }
  
      .orange-header {
        background-color: #E87345;
        height: 100px;
        margin-bottom: 40px;
      }
  
      .content {
        padding: 0 40px;
      }
  
      h1 {
        color: #000;
        font-size: 24px;
        margin: 0 0 20px 0;
        font-weight: normal;
      }
  
      p {
        color: #000;
        font-size: 16px;
        margin-bottom: 15px;
        line-height: 1.5;
      }
  
      .verification-code {
        display: flex;
        gap: 8px;
        margin: 20px 0;
      }
  
      .verification-code span {
        display: inline-block;
        padding: 8px 16px;
        border: 1px solid #E87345;
        border-radius: 4px;
        font-size: 24px;
        font-weight: bold;
        background-color: #fff;
      }
  
      .button {
        display: inline-block;
        margin: 10px 0 20px;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        color: #fff;
        background-color: #000;
        border: none;
        border-radius: 25px;
        text-decoration: none;
      }
  
      .signature {
        margin-top: 20px;
        margin-bottom: 40px;
      }
  
      .signature p {
        margin: 5px 0;
      }
  
      .signature .company-name {
        font-size: 20px;
        font-weight: 700;
      }
  
      .footer {
        background-color: #000;
        color: #fff;
        padding: 20px;
        text-align: center;
        font-size: 12px;
      }
  
      .footer p {
        color: #fff;
        margin: 5px 0;
        font-size: 12px;
      }
  
      .footer a {
        color: #fff;
        text-decoration: underline;
        margin: 0 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo-section">
        <img src="https://drive.google.com/uc?export=view&id=162Xg-4DS552bG_EJbfmsNrQDYcrt61Us" alt="Snaphomz">
      </div>
      <div class="orange-header"></div>
      <div class="content">
        <h1>Confirm Verification Code</h1>
        <p>Hi User,</p>
        <p>This is your verification code:</p>
        <div class="verification-code">
          ${verification_code
            .toString()
            .split('')
            .map((digit) => `<span>${digit}</span>`)
            .join('')}
        </div>
        <p>This code will only be valid for the next 5 minutes. If the code does not work, you can use this login verification link:</p>
        <a href="#" class="button">Verify Email</a>
        <div class="signature">
          <p>Thanks,</p>
          <p class="company-name">Snaphomz</p>
        </div>
      </div>
      <div class="footer">
        <p>© Snaphomz, 151 O'Connor Street, Ground Floor, Ottawa ON, K2P 2L8</p>
        <p>
          <a href="#">Unsubscribe</a> |
          <a href="#">View in the browser</a>
        </p>
      </div>
    </div>
  </body>
  </html>
    `;
};
