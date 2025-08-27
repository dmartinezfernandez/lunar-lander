import {Component, signal} from '@angular/core';
import {ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators} from '@angular/forms';
import {IntArrayValidator} from "./int.array.validator";
import {Lander, LanderState} from "./lander";

// Problem parameters.
const
    g = .001,
    u = 1.8,
    deltaT = 10,
    time0 = .0,
    altitude0 = 120,
    velocity0 = -1,
    dryMass = 16500,
    mass0 = 32500;

@Component({
    selector: 'app-root',
    imports: [FormsModule, ReactiveFormsModule],
    template: `
        <h1>{{ title() }}</h1>
        <br>
        <pre>CONTROL CALLING LUNAR MODULE. MANUAL CONTROL IS NECESSARY</pre>
        <pre>YOU MAY RESET FUEL RATE K EACH 10 SECS TO 0 OR ANY VALUE</pre>
        <pre>BETWEEN 8 & 200 LBS/SEC. YOU'VE 16000 LBS FUEL. ESTIMATED</pre>
        <pre>FREE FALL IMPACT TIME-120 SECS. CAPSULE WEIGHT-32500 LBS</pre>
        <pre>FIRST RADAR CHECK COMING UP</pre><br><br>
        <pre>COMMENCE LANDING PROCEDURE</pre>
        <pre>TIME,SECS   ALTITUDE,MILES+FEET   VELOCITY,MPH   FUEL,LBS   FUEL RATE</pre>
        @for (line of lines(); track $index) {
            <pre>{{ line }}</pre>
        }
        @if (finalState() == null) {
            <form style="display: flex; width: 100%;"
                  [formGroup]="form"
                  (ngSubmit)="enter()">
                {{ prompt }}?&nbsp;
                <input type="text" autofocus style="flex: 1;"
                       formControlName="input"
                       placeholder="{{ placeholder }}" value=""/>&nbsp;
                <button type="submit" [disabled]="!form.valid">&nbsp;Enter&nbsp;</button>
            </form>
        } @else {
            @if (runOutOfPropellantTime !== 0) {
                FUEL OUT AT {{ runOutOfPropellantTime.toFixed(2) }} SECS<br>
            }
            @let state = finalState()!;
            @let mph = -state.velocity * 3600;
            ON THE MOON AT {{ state.time.toFixed(2) }} SECS<br>
            @if (mph <= 1) {
                PERFECT LANDING !-(LUCKY)
            } @else if (mph <= 10) {
                GOOD LANDING-(COULD BE BETTER)
            } @else if (mph <= 22) {
                CONGRATULATIONS ON A POOR LANDING
            } @else if (mph <= 40) {
                CRAFT DAMAGE. GOOD LUCK
            } @else if (mph <= 60) {
                CRASH LANDING-YOU'VE 5 HRS OXYGEN
            } @else {
                SORRY,BUT THERE WERE NO SURVIVORS-YOU BLEW IT!<br>
                IN FACT YOU BLASTED A NEW LUNAR CRATER {{ (mph * .277777).toFixed(2) }} FT. DEEP
            }
            <br><br>
            <button type="button" (click)="reset()">&nbsp;Reset&nbsp;</button>
        }
    `,
    styles: [],
})
export class App {
    constructor() {
        console.log("Initial state", this.initialState);
    }

    private initialState = new LanderState(
        time0,
        altitude0,
        velocity0,
        dryMass,
        mass0
    );
    protected runOutOfPropellantTime: number = 0;
    protected readonly finalState = signal<LanderState | null>(null);
    protected readonly lander = new Lander(this.initialState, g, u);

    protected readonly title = signal('Lunar Lander');
    prompt: string = "K";
    placeholder = "Enter a value (or comma-separated values) here.";
    form = new FormGroup({
        input: new FormControl('', [Validators.required, IntArrayValidator()])
    })
    lines = signal<string[]>([formatLine(this.initialState, null)]);

    reset() {
        window.location.reload();
    }

    enter() {
        const input = this.form.value.input;
        if (input) {
            this.form.get('input')?.reset();
            const parts = input.split(',').map(p => Number(p.trim()));
            let current = this.lander.getState();
            let isTouchdown = false;
            for (let k of parts) {
                if (current.mass == current.dryMass) {
                    break; // ran out of fuel
                }
                isTouchdown = this.lander.compute(k, deltaT);
                current = this.lander.getState();
                console.log(`Powered flight (k: ${k})`, current);
                const newLine = formatLine(current, k);
                this.lines.update(value => [...value, newLine]);

                if (isTouchdown) {
                    this.finalState.set(current);
                    break;
                }
            }

            // If it runs out of propellant, compute the final ballistic flight.
            if (!isTouchdown && current.mass == current.dryMass) {
                this.runOutOfPropellantTime = current.time;
                this.lander.compute(0, deltaT); // returns true
                current = this.lander.getState();
                console.log("Ballistic flight", current);
                const newLine = formatLine(current, 0);
                this.lines.update(value => [...value, newLine]);
                this.finalState.set(current);
            }
        }
    }
}

function formatLine(value: LanderState, k: number | null) {
    const a = value.altitude;
    const mn = value.mass - value.dryMass;
    const l = value.time.toFixed(2).padStart(8, " ");
    const aMiles = Math.floor(a).toString().padStart(15, " ");
    const aFeet = Math.round((5280 * (a - Math.floor(a)))).toString().padStart(7, " ");
    const v = (3600 * -value.velocity).toFixed(2).padStart(15, " ");
    const fuel = mn.toFixed(1).padStart(12, " ");
    return `${l}${aMiles}${aFeet}${v}${fuel}         ${k?.toString().padStart(3) ?? ""}`;
}