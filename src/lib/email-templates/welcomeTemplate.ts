interface Params {
  first_name: string;
}

const welcomeTemplate = ({ first_name }: Params) => {
  return `<!DOCTYPE html>
<html
  lang="en"
  style="
    margin: 0;
    padding: 0;
    border-spacing: 0;
    box-sizing: border-box;
    font-family: 'IBM Plex Sans', sans-serif;
  "
>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet"
    />
    <title>Gadget Store - Welcome</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      border-spacing: 0;
      box-sizing: border-box;
      font-family: 'IBM Plex Sans', sans-serif;
      background-color: hsl(222.2 84% 4.9%);
    "
  >
    <center
      class="container"
      style="
        padding: 0;
        border-spacing: 0;
        box-sizing: border-box;
        font-family: 'IBM Plex Sans', sans-serif;
        max-width: 658px;
        margin: 0 auto;
      "
    >
      <table
        class="body"
        style="
          margin: 0;
          padding: 0;
          border-spacing: 0;
          box-sizing: border-box;
          font-family: 'IBM Plex Sans', sans-serif;
          background-color: #fff;
          width: 100%;
        "
        width="100%"
        bgcolor="#fff"
      >
        <!-- header -->
        <tr
          class="header"
          style="
            margin: 0;
            border-spacing: 0;
            box-sizing: border-box;
            font-family: 'IBM Plex Sans', sans-serif;
            display: block;
            width: 100%;
            background-color: #f5f9f5;
            padding: 36px 48px;
          "
          bgcolor="#f5f9f5"
        >
          <td
            style="
              margin: 0;
              padding: 0;
              border-spacing: 0;
              box-sizing: border-box;
              font-family: 'IBM Plex Sans', sans-serif;
            "
          >
            <div style="display: inline-flex; gap: 4px; align-items: center">
              <img
              src="http://localhost:3000/public/assets/icons/logo.svg"
              alt="#"
              style="
              width: 25px;
                margin: 0;
                padding: 0;
                border-spacing: 0;
                box-sizing: border-box;
                font-family: 'IBM Plex Sans', sans-serif;
              "
            />

              <span
                style="
                  font-weight: 500;
                  margin: 0;
                  padding: 0;
                  border-spacing: 0;
                  box-sizing: border-box;
                  font-family: 'IBM Plex Sans', sans-serif;
                "
                >Gadget Store</span
              >
            </div>
          </td>
        </tr>

        <!-- main content -->
        <tr
          class="main"
          style="
            margin: 0;
            border-spacing: 0;
            box-sizing: border-box;
            font-family: 'IBM Plex Sans', sans-serif;
            background-color: #fff;
            display: block;
            padding: 48px;
          "
          bgcolor="#fff"
        >
          <td
            class=""
            style="
              margin: 0;
              padding: 0;
              border-spacing: 0;
              box-sizing: border-box;
              font-family: 'IBM Plex Sans', sans-serif;
            "
          >
            <div
              class="main__content"
              style="
                margin: 0;
                padding: 0;
                border-spacing: 0;
                box-sizing: border-box;
                font-family: 'IBM Plex Sans', sans-serif;
              "
            >
              <h1
                class="main__content--header"
                style="
                  margin: 0;
                  padding: 0;
                  border-spacing: 0;
                  box-sizing: border-box;
                  font-family: 'IBM Plex Sans', sans-serif;
                  color: hsl(222.2 84% 4.9%);
                  font-size: 20px;
                  line-height: 140%;
                  letter-spacing: -2.44%;
                  font-weight: bold;
                  display: block;
                  padding-bottom: 40px;
                "
              >
                Welcome To Gadget Store
              </h1>

              <div
                class="main__content--body"
                style="
                  margin: 0;
                  padding: 0;
                  border-spacing: 0;
                  box-sizing: border-box;
                  font-family: 'IBM Plex Sans', sans-serif;
                  padding-bottom: 40px;
                "
              >
                <span
                  class="greeting"
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                    color: #1d2639;
                    line-height: 160%;
                    font-size: 16px;
                    font-weight: 600;
                    letter-spacing: -1.44%;
                  "
                  >Hey ${first_name.charAt(0).toUpperCase()}${first_name.slice(
    1
  )},</span
                >
                <br
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                  "
                />
                <br
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                  "
                />
                <p
                  class="text"
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                    color: #1d2639;
                    line-height: 160%;
                    font-size: 16px;
                    letter-spacing: -1.44%;
                  "
                >
                  We are happy to have you with us. This is the start of an
                  exciting journey and we can’t wait to see you experience our
                  seamless e-commerce experience! Let's make online shopping a breeze together!
                </p>
                <br
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                  "
                />
                <br
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                  "
                />
                <p
                  class="text"
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                    color: #1d2639;
                    line-height: 160%;
                    font-size: 16px;
                    letter-spacing: -1.44%;
                  "
                >
                  Thank you for choosing
                  <strong
                    class="logo-text"
                    style="
                      margin: 0;
                      padding: 0;
                      border-spacing: 0;
                      box-sizing: border-box;
                      font-family: 'IBM Plex Sans', sans-serif;
                      color: hsl(222.2 84% 4.9%);
                      font-weight: 700;
                    "
                    >Gadget Store</strong
                  >.
                </p>
                <br
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                  "
                />
                <br
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                  "
                />

                <p
                  class="text"
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                    color: #1d2639;
                    line-height: 160%;
                    font-size: 16px;
                    letter-spacing: -1.44%;
                  "
                >
                  Best regards,
                  <br
                    style="
                      margin: 0;
                      padding: 0;
                      border-spacing: 0;
                      box-sizing: border-box;
                      font-family: 'IBM Plex Sans', sans-serif;
                    "
                  />
                  Chidera, from Gadget Store HQ
                </p>
              </div>

              <a
                href="#"
                class="main__content--button button"
                style="
                  margin: 0;
                  border-spacing: 0;
                  box-sizing: border-box;
                  font-family: 'IBM Plex Sans', sans-serif;
                  margin-bottom: 40px;
                  display: inline-block;
                  padding: 19px 32px;
                  color: #fff;
                  background-color: hsl(221.2 83.2% 53.3%);
                  font-weight: bold;
                  font-size: 16px;
                  line-height: 140%;
                  letter-spacing: -1.44%;
                  text-decoration: none;
                "
                >Login</a
              >
            </div>

            <div
              class="footer"
              style="
                margin: 0;
                border-spacing: 0;
                box-sizing: border-box;
                font-family: 'IBM Plex Sans', sans-serif;
                background-color: #f5f7f9;
                padding: 32px;
              "
            >
              <div
                class="footer__text"
                style="
                  margin: 0;
                  padding: 0;
                  border-spacing: 0;
                  box-sizing: border-box;
                  font-family: 'IBM Plex Sans', sans-serif;
                  padding-bottom: 36px;
                "
              >
                <p
                  class="footer__text--paragraph"
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                    display: block;
                    padding-bottom: 24px;
                    color: #343f54;
                    font-size: 14px;
                    line-height: 140%;
                    letter-spacing: -1.44%;
                  "
                >
                  Need help?
                  <a
                    href="mailto:thechideraemmanuel@gmail.com"
                    style="
                      margin: 0;
                      padding: 0;
                      border-spacing: 0;
                      box-sizing: border-box;
                      font-family: 'IBM Plex Sans', sans-serif;
                      text-decoration: none;
                      color: hsl(221.2 83.2% 53.3%);
                    "
                    >Contact our support team</a
                  >. Want to give us feedback? Let us know what you think 
                  <a
                    href="mailto:thechideraemmanuel@gmail.com"
                    style="
                      margin: 0;
                      padding: 0;
                      border-spacing: 0;
                      box-sizing: border-box;
                      font-family: 'IBM Plex Sans', sans-serif;
                      text-decoration: none;
                      color: hsl(221.2 83.2% 53.3%);
                    "
                    >via email</a
                  >.
                </p>
              </div>

              <div
                class="footer__links"
                style="
                  margin: 0;
                  padding: 0;
                  border-spacing: 0;
                  box-sizing: border-box;
                  font-family: 'IBM Plex Sans', sans-serif;
                "
              >
                <a
                  href="#"
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                    text-decoration: none;
                    display: inline-block;
                    margin-right: 25px;
                  "
                >
                  <img
                    src="../assets/facebook-icon.png"
                    alt="facebook"
                    style="
                      margin: 0;
                      padding: 0;
                      border-spacing: 0;
                      box-sizing: border-box;
                      font-family: 'IBM Plex Sans', sans-serif;
                    "
                  />
                </a>
                <a
                  href="#"
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                    text-decoration: none;
                    display: inline-block;
                    margin-right: 25px;
                  "
                >
                  <img
                    src="../assets/linkedin-icon.png"
                    alt="linkedin"
                    style="
                      margin: 0;
                      padding: 0;
                      border-spacing: 0;
                      box-sizing: border-box;
                      font-family: 'IBM Plex Sans', sans-serif;
                    "
                  />
                </a>
                <a
                  href="#"
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                    text-decoration: none;
                    display: inline-block;
                    margin-right: 25px;
                  "
                >
                  <img
                    src="../assets/twitter-icon.png"
                    alt="twitter"
                    style="
                      margin: 0;
                      padding: 0;
                      border-spacing: 0;
                      box-sizing: border-box;
                      font-family: 'IBM Plex Sans', sans-serif;
                    "
                  />
                </a>
                <a
                  href="#"
                  style="
                    margin: 0;
                    padding: 0;
                    border-spacing: 0;
                    box-sizing: border-box;
                    font-family: 'IBM Plex Sans', sans-serif;
                    text-decoration: none;
                    display: inline-block;
                    margin-right: 0;
                  "
                >
                  <img
                    src="../assets/instagram-icon.png"
                    alt="instagram"
                    style="
                      margin: 0;
                      padding: 0;
                      border-spacing: 0;
                      box-sizing: border-box;
                      font-family: 'IBM Plex Sans', sans-serif;
                    "
                  />
                </a>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>
`;
};

export default welcomeTemplate;
