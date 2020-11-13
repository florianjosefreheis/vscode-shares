import polka from "polka";
import * as vscode from "vscode";
import { refreshTokenKey, accessTokenKey, apiBaseUrl } from "./constants";
import { Util } from "./util";

// https://github.com/shanalikhan/code-settings-sync/blob/master/src/service/github.oauth.service.ts
export const authenticate = () => {
  const app = polka();
  const server = app.listen(54321);
  vscode.commands.executeCommand(
    "vscode.open",
    vscode.Uri.parse(`${apiBaseUrl}/auth/github`)
  );
  app.get("/callback/:token/:refreshToken", async (req, res) => {
    const { token, refreshToken } = req.params;
    if (!token || !refreshToken) {
      res.end(`ext: something went wrong`);
      (app as any).server.close();
      return;
    }

    await Util.context.globalState.update(accessTokenKey, token);
    await Util.context.globalState.update(refreshTokenKey, refreshToken);

    res.end(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta
          http-equiv="Content-Security-Policy"
          content="default-src vscode-resource:; form-action vscode-resource:; frame-ancestors vscode-resource:; img-src vscode-resource: https:; script-src 'self' 'unsafe-inline' vscode-resource:; style-src 'self' 'unsafe-inline' vscode-resource:;"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      </head>
      <body>
          <h1>Success! You may now close this tab.</h1>
          <style>
            html, body {
              background-color: #1a1a1a;
              color: #c3c3c3;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100%;
              width: 100%;
              margin: 0;
            }
          </style>
      </body>
    </html>
    `);

    (app as any).server.close();
  });
};
