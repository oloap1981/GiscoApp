import { LoadingPage } from './pages/loading/loading';

import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Storage } from '@ionic/storage';

import { HomePage } from './pages/home/home';
import { LoginPage } from './pages/login/login';
import { ElencoSitiPage } from './pages/siti/elenco-siti/elenco-siti';
import { MappaSitiPage } from './pages/siti/mappa-siti/mappa-siti';
import { ElencoDispositiviPage } from './pages/dispositivi/elenco-dispositivi/elenco-dispositivi';
import { MappaDispositiviPage } from './pages/dispositivi/mappa-dispositivi/mappa-dispositivi';
import { CartellePage } from './pages/documenti/cartelle/cartelle';
import { ElencoMessaggiPage } from './pages/messaggi/elenco-messaggi/elenco-messaggi';
import { DashboardProfiloPage } from './pages/profilo/dashboard-profilo';
import { ElencoProcedimentiPage } from './pages/procedimenti/elenco-procedimenti/elenco-procedimenti';
import { ElencoOsservazioniPage } from './pages/osservazioni/elenco-osservazioni/elenco-osservazioni';
import { ElencoAttivitaPage } from './pages/attivita/elenco-attivita/elenco-attivita';
import { Firebase } from '@ionic-native/firebase';

import { CommonService } from './services/shared/common.service';
import { StoreService} from './services/store/store.service';

import { Login } from './models/login/login.namespace';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage = LoadingPage;//home
  pages: Array<{ title: string, component: any }>;
  private pagineSenzaMenu: Array<string> = new Array("LoadingPage", "LoginPage");

  private numNotifiche_attivita = 0;
  private numNotifiche_osservazioni = 0;
  private numNotifiche_prescrizioni= 0;
  private numNotifiche_messaggi = 0;
  private numNotifiche_commenti_at = 0;
  private numNotifiche_commenti_os = 0;

  public viewMenu: boolean = false;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    private storage: Storage,
    public splashScreen: SplashScreen,
    private firebase: Firebase,
    public commonService: CommonService,
    public storeService: StoreService
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'Elenco Siti', component: ElencoSitiPage },
      { title: 'Mappa Siti', component: MappaSitiPage },
      { title: 'Elenco Dispositivi', component: ElencoDispositiviPage },
      { title: 'Mappa Dispositivi', component: MappaDispositiviPage },
      { title: 'Documenti', component: CartellePage },
      { title: 'Messaggi', component: ElencoMessaggiPage },
      { title: 'Procedimenti', component: ElencoProcedimentiPage },
      { title: 'Osservazioni', component: ElencoOsservazioniPage },
      { title: 'Attività', component: ElencoAttivitaPage },
      { title: 'Profilo', component: DashboardProfiloPage },
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      console.log("PIPPO");
    //  console.log(this.platform.platforms());
      if (!this.platform.is('mobileweb')) {//serve per testare con ionic serve -l, prima di release va cancellato
        if (this.platform.is('ios')) {
          this.firebase.grantPermission()
            .then(() => {
              this.firebase.getToken().then(token => console.log(`PIPPO The token is ${token}`)) // save the token server-side and use it to push notifications to this device
                .catch(error => console.error('Error getting token', error));
            });
        } else {
          this.firebase.getToken().then(token => console.log(`PIPPO The token is ${token}`)) // save the token server-side and use it to push notifications to this device
            .catch(error => console.error('Error getting token', error));
        }
        if (this.platform.is('ios') || this.platform.is('android')) {
          this.firebase.onNotificationOpen()
            .subscribe(data => console.log(`User opened a notification ${data}`));
        }
      }
      /*
     this.firebase.onTokenRefresh()
       .subscribe((token: string) => console.log(`Got a new token ${token}`));*/
    });

    //carico le notifiche per le pagine nel menu
    this.storeService.getUserDataPromise().then((val: Login.ws_Token) => {
      var tokenValue = val.token_value;
      this.commonService.getNotifiche(tokenValue).subscribe(r => {
        var notifiche = r.l_notifiche;
        for (let notifica of notifiche) {
          switch(notifica.notifica_type){
            case "attivita": {
              if(notifica.notifica_count){
                this.numNotifiche_attivita = notifica.notifica_count;
              }
            }
            case "osservazioni": {
              if(notifica.notifica_count){
                this.numNotifiche_osservazioni = notifica.notifica_count;
              }
            }
            case "prescrizioni": {
              if(notifica.notifica_count){
                this.numNotifiche_prescrizioni = notifica.notifica_count;
              }
            }
            case "messaggi": {
              if(notifica.notifica_count){
                this.numNotifiche_messaggi = notifica.notifica_count;
              }
            }
            case "commenti_at": {
              if(notifica.notifica_count){
                this.numNotifiche_commenti_at = notifica.notifica_count;
              }
            }
            case "commenti_os": {
              if(notifica.notifica_count){
                this.numNotifiche_commenti_os = notifica.notifica_count;
              }
            }
          }
        }
        console.log('ADESSO POSSO RENDERIZZARE LA LISTA');
        this.viewMenu = true;
      });
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
  /*
    public showMenu(): boolean {
      let view = this.nav.getActive();
      if (view) {
        return this.pagineSenzaMenu.indexOf(view.name) === -1;
      } else
        return false;
    };*/

  public logOut() {
    this.storage.clear();
    this.menu.close();
    this.nav.setRoot(LoginPage);
  };

  public getNumeroNotifiche(titolo: string): string {
    var toReturn = '';
    switch(titolo){
      case "Attività": 
        if(this.numNotifiche_attivita > 0){
          toReturn = '('+this.numNotifiche_attivita+')';
        }
        break;
      case "Osservazioni": 
        if(this.numNotifiche_osservazioni > 0){
          toReturn = '('+this.numNotifiche_osservazioni+')';
        }
        break;
      case "Prescrizioni": 
        if(this.numNotifiche_prescrizioni > 0){
          toReturn = '('+this.numNotifiche_prescrizioni+')';
        }
        break;
      case "Messaggi": 
        if(this.numNotifiche_messaggi > 0){
          toReturn = '('+this.numNotifiche_messaggi+')';
        }
        break;
      case "Commenti Attivita": 
        if(this.numNotifiche_commenti_at > 0){
          toReturn = '('+this.numNotifiche_commenti_at+')';
        }
        break;
      case "Commenti Osservazioni": 
        if(this.numNotifiche_commenti_os > 0){
          toReturn = '('+this.numNotifiche_commenti_os+')';
        }
        break;
      default: 
        toReturn = '';
        break;
    }

    console.log('notifiche per ' + titolo + ': ' + toReturn);
    return toReturn;
  }

  /*
  @Component({
    templateUrl: 'app.html',
    styles: ['app.scss']
  })
  export class MyApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any = LoadingPage;
  
    private pagineSenzaMenu: Array<string> = new Array("LoadingPage", "LoginPage");
  
    constructor(platform: Platform,
      statusBar: StatusBar,
      splashScreen: SplashScreen,
      private storage: Storage,
      private menuCtrl: MenuController ) {
  
      platform.ready().then(() => {
        statusBar.styleDefault();
        splashScreen.hide();
      });
    };
  
    public logOut(): void {
      this.storage.clear();
      this.menuCtrl.close();
      this.nav.setRoot(LoginPage);
    };
  
    public goToHome(): void {
      this.nav.setRoot(HomePage);
    }
  
    public showMenu(): boolean {
      let view = this.nav.getActive();
      if (view) {
        return this.pagineSenzaMenu.indexOf(view.name) === -1;
      } else return false;
    };
  
    public goToListaSiti(): void {
      this.nav.push(ElencoSitiPage);
      this.menuCtrl.close();
    }
  
    public goToMappaSiti(): void {
      this.nav.push(MappaSitiPage);
      this.menuCtrl.close();
    }
  
    public goToListaDispositivi(): void {
      this.nav.push(ElencoDispositiviPage);
      this.menuCtrl.close();
    }
  
    public goToMappaDispositivi(): void {
      this.nav.push(MappaDispositiviPage);
      this.menuCtrl.close();
    }
  
  
    public goToChat(): void {
      this.nav.push(ChatPage);
      this.menuCtrl.close();
    }
  
    public goToDocumenti(): void {
      this.nav.push(CartellePage);
      this.menuCtrl.close();
    }
  
    public goToMessaggi(): void {
      this.nav.setRoot(ElencoMessaggiPage);
      this.menuCtrl.close();
    }
    
    public goToProfilo(): void {
      this.nav.setRoot(DashboardProfiloPage);
      this.menuCtrl.close();
    }
  }*/

}