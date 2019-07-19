import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { IonicModule } from 'ionic-angular';

// #REGION - Componenti
import { MapComponent } from '../../components/map/map.component';

@NgModule({
	declarations: [MapComponent],
	imports: [IonicModule, AgmCoreModule],
	exports: [IonicModule,
		MapComponent]
})
export class ComponentsModule {}
