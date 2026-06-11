import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteLoader } from './shared/ui/site-loader/site-loader';
import { SiteHeader } from './shared/ui/site-header/site-header';
import { SiteFooter } from './shared/ui/site-footer/site-footer';
import { RideProgress } from './shared/ui/ride-progress/ride-progress';

@Component({
  selector: 'jh-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SiteLoader, SiteHeader, SiteFooter, RideProgress],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
