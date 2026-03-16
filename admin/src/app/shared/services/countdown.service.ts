import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountdownService implements OnDestroy {
  public countdown: number = 0;
  private countdownSubscription: Subscription;

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  startCountdown(seconds: number): void {
    this.stopCountdown();
    this.countdown = seconds;
    // console.log('[Countdown] Started with', seconds, 'seconds');

    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
        // console.log('[Countdown]', this.countdown);
      } else {
        this.stopCountdown();
      }
    });
  }

  stopCountdown(): void {
    if (this.countdownSubscription) {
      // console.log('[Countdown] Stopped');
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
  }
}
