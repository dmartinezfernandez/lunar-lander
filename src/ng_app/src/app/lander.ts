// Error values.
const deltaV = 1.89e-4, // 1 foot/s
    deltaR = 1.89e-4, // 1 foot
    epsilonT = 1e-2; // 0.01 s

/**
 * Represents the state of the landing rocket.
 */
export class LanderState {
    constructor(
        public time = .0,
        public altitude = .0,
        public velocity = .0,
        public dryMass = .0,
        public mass = .0) {
    }

    public clone() {
        return new LanderState(
            this.time,
            this.altitude,
            this.velocity,
            this.dryMass,
            this.mass);
    }
}

/**
 * Main class representing the landing rocket, responsible for all calculations.
 */
export class Lander {
    constructor(private state: LanderState, private g: number, private u: number) {
    }

    /**
     * Get the current state.
     */
    public getState() {
        return this.state.clone();
    }

    /**
     * Computes the new state and returns true if the rocket lands (soft or hard).
     *
     * @param k fuel rate
     * @param t delta time
     * @constructor
     */
    public compute(k: number,
                   t: number): boolean {
        const s0 = this.state; // initial state
        const s1 = new LanderState();
        let t1 = t; // actual value of t when the termination conditions are met

        // Check if it ran out of propellant, then return the result of a ballistic flight.
        if (this.state.mass == this.state.dryMass) {
            // Ballistic flight.
            t1 = (s0.velocity + Math.sqrt(s0.velocity * s0.velocity + 2 * this.g * s0.altitude)) / this.g;
            s1.time = s0.time + t1;
            s1.altitude = 0;
            s1.velocity = v(t1, s0.velocity, s0.mass, this.u, 0, this.g);
            this.state = s1;
            return true;
        }

        // If it runs out of propellant, update t1.
        const remainingPropellant = this.state.mass - this.state.dryMass;
        if (k > 0 && remainingPropellant < k * t1) {
            t1 = remainingPropellant / k;
        }

        // Check for temporary ascent and lowest point, then update t1.
        const v1 = v(t1, s0.velocity, s0.mass, this.u, k, this.g);
        if (s0.velocity <= 0 && v1 > 0) {
            // Look at the lowest point of the trajectory.
            const tMinAltitude = bisection(
                (x) => v(x, s0.velocity, s0.mass, this.u, k, this.g),
                0,
                t,
                deltaV,
                epsilonT);
            const minAltitude = r(tMinAltitude, s0.altitude, s0.velocity, s0.mass, this.u, k, this.g);
            console.log(`Temporary ascent at ${s0.time}+${tMinAltitude}, minimal altitude ${minAltitude}.`);
            if (minAltitude <= 0) {
                t1 = tMinAltitude;
            }
        }

        // Check for touchdown, then update t1.
        const r1 = r(t1, s0.altitude, s0.velocity, s0.mass, this.u, k, this.g);
        const touchdown = r1 <= 0
        if (touchdown) {
            // Update t1
            t1 = bisection(
                (x) => r(x, s0.altitude, s0.velocity, s0.mass, this.u, k, this.g),
                0, // lower bound
                t1, // upper bound
                deltaR,
                epsilonT); // know when you've hit rock bottom
        }

        // Compute s1 properties.
        s1.time = s0.time + t1;
        s1.dryMass = s0.dryMass;
        s1.mass = s0.mass - k * t1;
        s1.altitude = touchdown
            ? 0 // disregard the error by ignoring the decimals
            : r(t1, s0.altitude, s0.velocity, s0.mass, this.u, k, this.g);
        s1.velocity = v(t1, s0.velocity, s0.mass, this.u, k, this.g);
        this.state = s1;
        return touchdown;
    }
}

/**
 * Velocity of a rocket in a gravitational field.
 */
function v(t: number, v0: number, m0: number, u: number, k: number, g: number): number {
    const v = v0 - g * t;
    if (k == 0)
        return v; // ballistic flight
    return v + u * Math.log(m0 / (m0 - k * t)); // powered flight
}

/**
 * Altitude of a rocket in a gravitational field.
 */
function r(t: number, r0: number, v0: number, m0: number, u: number, k: number, g: number): number {
    const r = r0 + v0 * t - g * t * t / 2;
    if (k == 0)
        return r; // ballistic flight
    return r + u * ((m0 / k - t) * Math.log((m0 - k * t)/m0) + t); // powered flight
}

/**
 * Returns the root of a function in an interval [a, b].
 *
 * The bisection method stops only when both criteria are satisfied: the absolute error in the function value is less
 * than delta (|f(x)| < δ) AND the interval width (or change in x) is less than epsilon (error < ε).
 *
 * @param f a numeric function f(x)
 * @param a the lower bound of the interval
 * @param b the upper bound of the interval
 * @param delta (δ) tolerance in f
 * @param epsilon (ε) tolerance in x
 * @param nMax maximum number of iterations
 */
function bisection(
    f: (x: number) => number,
    a: number,
    b: number,
    delta: number,
    epsilon: number,
    nMax: number = 1000
): number {
    let fa = f(a);
    let fb = f(b);

    if (a >= b) {
        throw new Error("Invalid interval [a, b].")
    }
    if (Math.sign(fa) == Math.sign(fb)) {
        throw new Error("Function has same signs at a and b.");
    }

    let error = b - a;
    for (let i = 0; i < nMax; i++) {
        error = error / 2;
        const c = a + error;
        const fc = f(c);

        if (Math.abs(fc) < delta && Math.abs(error) < epsilon) {
            console.log(`Bisection algorithm completed (i: ${i}, c: ${c}, fc: ${fc}, δ: ${delta}, error: ${error}, ε: ${epsilon}).`);
            return c;
        }

        if (Math.sign(fa) != Math.sign(fc)) {
            b = c;
            fb = fc;
        } else {
            a = c;
            fa = fc;
        }
    }

    throw new Error("Root not found within the maximum number of iterations.");
}
