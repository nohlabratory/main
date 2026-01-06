import { Component, signal, computed, effect, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type AppState = 'boot' | 'collecting' | 'blackout' | 'finalizing' | 'complete';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit, OnDestroy {
  // --- State Signals ---
  state = signal<AppState>('boot');
  
  // Boot/Log State
  logs = signal<string[]>([]);
  
  // Collection Phase State (The 7 Hour Loading)
  collectionProgress = signal<number>(0);
  linksFound = signal<number>(0);
  currentTask = signal<string>('Initializing spider...');
  
  // Final Phase State (The 0-100% Counter)
  finalPercent = signal<number>(0);
  
  // --- Internal Logic Variables ---
  private bootLinesSource = [
    '[INIT] Starting T-Gen Scraper v4.5.2...',
    '[INIT] Loading Python 3.11 environment...',
    '[ OK ] Telethon library loaded.',
    '[ OK ] PySocks loaded.',
    '[INFO] Reading config.ini...',
    '[INFO] Loading proxies from proxies.txt...',
    '[ OK ] 4,210 Proxies valid.',
    '[NET] Connecting to Telegram API (Layer 162)...',
    '[NET] Handshake successful. DC: 4 (Europe).',
    '[INFO] Bypassing flood wait protections...',
    '[ OK ] Session #1 (USA) - Active',
    '[ OK ] Session #2 (India) - Active',
    '[ OK ] Session #3 (Russia) - Active',
    '[INFO] Target Mode: GLOBAL_SCRAPE',
    '[INFO] Keywords: "crypto", "marketing", "investing"',
    '[WARN] Anti-Bot heuristics detected.',
    '[INFO] Enabling random sleep intervals.',
    '[TASK] Starting Group Link Collector Service...',
  ];
  
  private collectionTasks = [
    'Scraping specific keywords...',
    'Parsing HTML content...',
    'Validating invite links...',
    'Filtering dead groups...',
    'Extracting user IDs...',
    'Bypassing privacy settings...',
    'Saving to database...',
    'Rotating user agents...',
    'Analyzing member activity...'
  ];

  private intervals: any[] = [];
  
  formattedFinalPercent = computed(() => {
    return this.finalPercent().toFixed(5);
  });

  // High precision for the slow 7-hour count
  formattedCollectionPercent = computed(() => {
    return this.collectionProgress().toFixed(6);
  });

  ngOnInit() {
    this.runBootSequence();
  }

  ngOnDestroy() {
    this.clearAllIntervals();
  }

  private clearAllIntervals() {
    this.intervals.forEach(i => clearInterval(i));
    this.intervals = [];
  }

  // --- Phase 1: Boot Sequence ---
  private runBootSequence() {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= this.bootLinesSource.length) {
        clearInterval(interval);
        setTimeout(() => this.startCollectionPhase(), 800);
        return;
      }
      this.logs.update(logs => [...logs, this.bootLinesSource[index]]);
      index++;
    }, 60); // Faster boot
    this.intervals.push(interval);
  }

  // --- Phase 2: Collection (7 Hours) ---
  private startCollectionPhase() {
    this.state.set('collecting');
    
    // Duration: 7 Hours
    const startTime = Date.now();
    const totalTimeMs = 7 * 60 * 60 * 1000; 
    
    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / totalTimeMs) * 100, 100);
      this.collectionProgress.set(progress);
      
      // Randomly increase links found (less frequent now due to long duration)
      if (Math.random() > 0.95) {
        this.linksFound.update(n => n + Math.floor(Math.random() * 2) + 1);
      }

      // Randomly change task text and log
      if (Math.random() > 0.98) {
        const task = this.collectionTasks[Math.floor(Math.random() * this.collectionTasks.length)];
        this.currentTask.set(task);
        // Also add to logs occasionally
        if (Math.random() > 0.6) {
           this.logs.update(l => [...l.slice(-15), `[WORK] ${task}`]);
        }
      }

      if (elapsed >= totalTimeMs) {
        this.clearAllIntervals();
        this.startBlackoutPhase();
      }
    }, 100); // Fast updates to animate the high-precision decimal
    
    this.intervals.push(tick);
  }

  // --- Phase 3: Blackout ---
  private startBlackoutPhase() {
    this.state.set('blackout');
    // Wait in darkness
    setTimeout(() => {
      this.startFinalPhase();
    }, 3500);
  }

  // --- Phase 4: Final Counter (0-100%) ---
  private startFinalPhase() {
    this.state.set('finalizing');
    
    let current = 0;
    
    // Counts from 0.00000 to 100.00000
    const runCounter = () => {
      const remaining = 100 - current;
      let increment = 0;

      // Variable speed curve
      if (current < 15) increment = Math.random() * 0.1;
      else if (current < 60) increment = Math.random() * 0.3;
      else if (current < 85) increment = Math.random() * 0.1;
      else if (current < 98) increment = Math.random() * 0.05;
      else increment = Math.random() * 0.002; // Very slow finish

      current += increment;

      if (current >= 100) {
        current = 100;
        this.finalPercent.set(100);
        setTimeout(() => this.state.set('complete'), 1500);
      } else {
        this.finalPercent.set(current);
        requestAnimationFrame(runCounter);
      }
    };

    requestAnimationFrame(runCounter);
  }

  reset() {
    this.clearAllIntervals();
    this.state.set('boot');
    this.logs.set([]);
    this.collectionProgress.set(0);
    this.linksFound.set(0);
    this.finalPercent.set(0);
    this.runBootSequence();
  }
}