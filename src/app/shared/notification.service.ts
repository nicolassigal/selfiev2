import { Http, ResponseContentType } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private _http: Http
  ) { }

  notify = (to, body, subject, altBody?) => {
    const template = `
    <!DOCTYPE html>
      <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Title</title>
            <style>
            .mail-content,footer{position:relative}.brand,footer{background-color:#19156a}article,footer{font-family:helvetica}
            body,html{padding:0;margin:0}body{background-color:#fcfcfc}.row{margin:0 15px}footer>p,ul{margin:0}article{padding:2% 5%;color:#19156a}
            .col-xs-6{width:50%}.col-xs-6>img,footer{width:100%}.left-panel{float:left}.right-panel{float:right}
            footer{bottom:0;text-align:center;border-top:5px solid #b4ec13;color:#b4ec13;font-size:13px;line-height:25px;padding:10px 0}
            footer a{text-decoration:none;color:#b4ec13}footer>img{width:70px}.brand>img{padding:20px}.brand hr{background-color:#b4ec13;height:5px;border:0}
            ul{list-style:none;padding:2%}ul li{padding-bottom:10px}span{color:gray}
            </style>
        </head>
        <body>
            <div class="nav">
                <div class="brand">
                    <img src="https://tucourier.com.ar/wp-content/uploads/2016/09/160x40.png" alt="logo">
                    <hr>
                </div>
            </div>
            <div class="row mail-content">
            ${body}
            </div>
            <footer>
                <p>
                Arregui 6395 | Tercer Piso "C" | CABA (1408) 
            </p>   
            <p>
                155311-6210 | 153168-8888 
            </p>
            <p>
              <a href="https://tucourier.com.ar/">www.tucourier.com.ar</a>
          </p>
        </footer>
        </body>
      </html>
    `;
    const data = { to: to, body: template, subject: subject, altBody: altBody || '' };
    return this._http.post('https://www.tucourier.com.ar/selfie-v2/server/notifications/notify.php', data);
  }
}
