import { DataService } from './../shared/data.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { element } from 'protractor';
import { AngularFirestore } from 'angularfire2/firestore';
import { take, takeUntil } from 'rxjs/operators';
import { UtilsService } from '../shared/utils.service';
import { componentDestroyed } from 'ng2-rx-componentdestroyed';
import { NotificationService } from '../shared/notification.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loggingin = false;
  registering = false;
  registered = false;
  loginFormActive = true;
  error;
  email;
  password;
  password2;
  users = [];
  user = {
    name: null,
    email: null,
    username: null,
    cuit: null,
    address: null,
    city: null,
    country: null,
    tel: null,
    role: 0,
    id: null,
    updatedInfo: false,
    password: null
  };
  subject = 'Bienvenido a HBR - Selfie';
  template = `
    <article>
      <p>Hola ${ this.user.name }, gracias por elegirnos, a partir de ahora vas a poder realizar tus compras y recibirlas en Tu casa, con nuestro servicio courier.</p>
      <p>Tu número de cliente es: ${ this.user.id } </p>
      <p>Por favor tené en cuenta las siguientes consideraciones:</p>
      <ol>
        <li>Las cajas deberán ir rotuladas con tu nombre y tu número de cliente.</li>
        <li>Al efectuar el envío por favor informarnos el número de tracking para realizar el seguimiento.</li>
        <li>Enviarnos por mail adjunto de factura con detalle de la compra.</li>
      </ol>
      <p>Recordá que nuestro servicio comienza con la recepción de tus compras en nuestros depósitos; si tenés alguna duda con respecto al ingreso de la mercadería  a EEUU,  por favor confirmá con tu proveedor o consultanos.</p>
      <p>Para más información del Régimen Aduanero Courier vigente podés consultarlo en nuestra página  https://tucourier.com.ar/  en nuestra sección Preguntas Frecuentes.</p>
      <p>Podes ingresar a https://tucourier.com.ar/ boton ”selfie” y registrate con tu usuario y contraseña:</p>
      <ul>
        <li>e-mail: ${ this.user.email }</li>
        <li>Password: ${ this.user.password }</li>
      </ul>
      <p>Y comenza a utilizar nuestros sistemas de control de Stock</p>
      <p>El domicilio de nuestro WH en Miami es:</p>
      <ul>
        <li><b>12307 SW 133 CT</b></li>
        <li><b>MIAMI FL 33186</b></li>
        <li><b>tel +1 (786) 357-8906</b></li>
      </ul>
      <p>Nota: Si realizas tus compras fuera de EEUU y las envías a EEUU, tene en cuenta las siguientes consideraciones aduaneras:</p>
      <img src="https://lh6.googleusercontent.com/AM-kwz3J5zOFm05u9wjJ1bP7ll6o3oTZmJNLuQcJwzHrUvBn7zqdXjO9qasLnahLX_kAvjq63nffYdj9ZpB3EhBfmhZONGZoSsHKFEsqr6qqgILiGYXYT6EnPWHRv1tvvgQFuQ1C" />
      <p>Al pie mis datos para cualquier consulta,</p>
      <p>Santiago</p>
    </article>
  `;
  constructor(private auth: AngularFireAuth,
    private router: Router,
    private _db: AngularFirestore,
    private authService: AuthService,
    private _dataService: DataService,
    private _utils: UtilsService,
    private _notificationService: NotificationService) { }

  ngOnInit() {
    this.error = '';

    if (this.authService._isAuthenticated()) {
      this.router.navigate(['dashboard']);
    }
    this._db.collection('users')
    .valueChanges()
    .pipe(takeUntil(componentDestroyed(this)))
    .subscribe((users) => {
      this.users = users;
    });
  }

  ngOnDestroy() {
  }

  login = () => {
    if (this.email && this.password && this.users) {
      this.loggingin = true;
      const dbUser = this.users.filter(user => user['username'] === this.email);
      if (dbUser[0]  && (dbUser[0]['deleted'] === 0 || !dbUser[0]['deleted'])) {
        this.auth.auth.signInWithEmailAndPassword(this.email, this.password)
          .then(res => {
            this.auth.auth.currentUser.getIdToken().then(token => {
              const role = dbUser[0]['role'] || 0;
              this.authService._setToken(token, role);
              this._dataService.setCustomers(this.users);
              this.router.navigate(['dashboard']);
              this.loggingin = false;
              this.error = '';
            });
          }).catch(err => this.handleErrors(err.code));
      } else {
      this.handleErrors('auth/user-not-found');
      }
    } else {
      this.error = 'You must provide an username/password';
    }
  }

  switchTo = () => {
    this.user = {
      name: null,
      email: null,
      username: null,
      cuit: null,
      address: null,
      city: null,
      country: null,
      tel: null,
      role: 0,
      id: null,
      updatedInfo: false,
      password: null
    };
    this.loginFormActive = !this.loginFormActive;
    this.email = '';
    this.password = '';
    this.password2 = '';
    this.error = '';
    this.registering = false;
    this.registered = false;
    this.loggingin = false;
  }

  register = () => {
    if (this.email && this.password && this.password2) {
      if (this.password === this.password2) {
        this.registering = true;
        this.auth.auth.createUserWithEmailAndPassword(this.email, this.password)
          .then(res => {
            this.user.email = this.email;
            this.user.username = this.email;
            this.user.password = this.password;
            this.user.role = 0;
            this.user.id = this._utils.getId(this.users);
            this.user.updatedInfo = true;
            this._db.collection('users').doc(`${this.user.id}`).set(this.user)
              .then(() => {
                this._notificationService.notify(this.user.email, this.template, this.subject).subscribe(() => {
                  this.loggingin = false;
                  this.error = '';
                  this.registering = false;
                  this.registered = true;
                });
              }).catch(err => console.log(err));
          }).catch(err => this.handleErrors(err));
      } else {
        this.error = 'Passwords doesnt match';
      }
    } else {
      this.error = 'You must provide an username/password';
    }
  }

  navToRegister = () => {
    this.router.navigate(['register']);
  }

  handleErrors = (e) => {
    this.loggingin = false;
    this.registering = false;
    switch (e.code) {
      case 'auth/invalid-email':
        this.error = 'Please enter a valid E-mail';
        break;
      case 'auth/email-already-in-use':
        this.error = 'E-mail already exists';
        break;
      case 'auth/weak-password':
        this.error = 'Password should be at least 6 characters';
        break;
      case 'auth/user-not-found':
        this.error = 'Please enter a valid username/password';
        break;
      default:
        this.error = 'Please enter a valid username/password';
        break;
    }
  }
}
