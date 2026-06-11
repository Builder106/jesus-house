import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * jh-site-footer — refined footer on the deep-indigo (jh-night) ground.
 *
 * Bookends the cathedral sections: seal, parish name, address, tel/mailto
 * links, the RCCG attribution line, and © 2026. Small-caps letterspaced
 * labels and gold hairline rules. Purely static — SSR-safe by construction.
 *
 * No member PII: contains only the parish's public street address, phone,
 * and email — no congregant names, photos, or personal details.
 */
@Component({
  selector: 'jh-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
})
export class SiteFooter {
  protected readonly year = 2026;
}
