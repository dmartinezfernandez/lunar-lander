# Lunar Lander

Go to [Lunar Lander](https://dmartinezfernandez.github.io/lunar-lander) in dmartinezfernandez's GitHub Pages.

## The Problem<sup>[1](#storer)</sup>

You’re 120 miles above the surface of the moon, and your automated landing
system has failed! You’re now in freefall and must take manual control to land
safely.

To avoid crashing, slow your descent by firing your engines. But use your fuel
wisely: You only have 16,000 pounds, and if you run out before landing, you
could crash.

Safely touch down a lunar lander on the moon without crashing and before you run
out of fuel.

Initial state:

- Dry mass: 16,500 lb
- Wet mass: 32,500 lb
- Altitude: 120 mi
- Velocity: -3,600 MPH (-1 mi/s)
- Gravity: -.001 mi/s^2
- Exhaust gas velocity (thrust): 1.8 mi/s

Landing criteria (velocity in MPH):
- "PERFECT LANDING !-(LUCKY)": `[0, 1]`
- "GOOD LANDING-(COULD BE BETTER)": `(1, 10]`
- "CONGRATULATIONS ON A POOR LANDING": `(10, 22]`
- "CRAFT DAMAGE. GOOD LUCK": `(22, 40]`
- "CRASH LANDING-YOU'VE 5 HRS OXYGEN": `(40, 60]`
- "SORRY,BUT THERE WERE NO SURVIVORS-YOU BLEW IT!": `> 60`  
  "IN FACT YOU BLASTED A NEW LUNAR CRATER [W * .277777] FT. DEEP"

## Analysis

### Descent and landing cases<sup>[2](#martin)</sup>

- Powered/ballistic flight: The module burns fuel properly (or reserves), slows down, and lands
gently.
- Temporary ascent: If too much thrust is applied, the module rises briefly,
then corrects and continues descending.
- Insufficient fuel burn: If the module doesn't burn enough fuel to slow down
fully, it crashes.
- Free fall (ballistic flight): If fuel runs out, the module falls uncontrolled
and eventually crashes.

### The rocket in a gravitational field

As the rocket engine operate, it is continuously ejecting burned fuel gases,
which have both mass and velocity, and therefore some momentum. We will assume
the burned fuel is being ejected at a constant rate, which means the rate of
change of the rocket's momentum is also constant, which means a constant force
on the rocket.

However, as time goes on, the mass of the rocket (which includes the mass of
the remaining fuel) continuously decreases. Thus, even though the force on the
rocket is constant, the resulting acceleration is not; it is continuously
increasing.

So, the total change of the rocket's velocity will depend on the amount of
mass of fuel that is burned, and that dependence is not linear.

Let

- $m_0$ be the mass of the rocket at the initial time $t = 0$, which includes
the mass of the rocket at burnout (final mass) $m_f$ and the mass of the
remaining propellant,
- $m$ be the mass of the rocket at a time $t$,
- $m_p$ be the propulsion mass (the ejected gases),
- $k = \frac{dm_p}{dt}$ be the burned fuel rate, assumed constant in the context
of the problem. Notice that $\frac{dm_p}{dt} > 0$, so $\frac{dm}{dt} = - \frac{dm_p}{dt} < 0$)

Then, $`m(t) = m_0 - k\, t`$.

The thrust of a rocket is determined by the product of propellant mass flow rate
and exhaust velocity.

Let

- $\boldsymbol{v_{ex}}$ be the **exhaust velocity**,
- $\boldsymbol{F_{ex}}$ be the **momentum thrust** force (the force applied to the rocket by
the ejected exhaust gases).

Then, $`\boldsymbol{F_{ex}} = \dot{m} \, \boldsymbol{v_{ex}} = - k\, \boldsymbol{v_{ex}}`$, which is constant over the time span $t$.

There exist other physical effects, such as gas pressure for jet engines or
relativistic effects, which contribute to the thrust. These effects are taken
into account by a corresponding additional thrust term $\boldsymbol{F_{+}}$, and
thus obtaining the _total thrust_ of a reaction engine
$`\boldsymbol{F_{*}} = \boldsymbol{F_{ex}} + \boldsymbol{F_{+}} = \dot{m} \, \boldsymbol{v_{*}}`$,
and defining the _effective exhaust velocity_
$`\boldsymbol{v_{*}} = \boldsymbol{v_{ex}} + \frac{\boldsymbol{F_{+}}}{\dot{m_p}}`$.

Within the scope of the problem, I will limit my analysis to the simplifications
given. Further details can be found in Walter (2024)<sup>[4](#walter)</sup>.

Let

- $\boldsymbol{F_G}$ be the gravitational force,
- $\boldsymbol{g}$ be the acceleration of gravity, assumed constant in the
context of the problem.

Then, $`\boldsymbol{F_G}(t) = m(t)\, \boldsymbol{g}`$.

I define the vertical axis $\boldsymbol{j}$ so that the component of
$`\boldsymbol{F_G} = m \, \boldsymbol{g}`$ is negative, while the component of
$`\boldsymbol{F_{ex}} = - k \, \boldsymbol{v_{ex}}`$ is positive, as shown in
the figure below.

```math
\begin{aligned}
\uparrow \; \boldsymbol{F_{ex}} \\
Rocket \\
\downarrow \; \boldsymbol{F_{G}} \\
\; \\
Moon
\end{aligned}
```

When these non-inertial forces $\boldsymbol{F_{ex}}$ and $\boldsymbol{F_G}$ are
taken into account, _Newton's second law of motion_ can be written as
$m \, \boldsymbol{\dot{v}} = \boldsymbol{F_{ex}} + \boldsymbol{F_G}$.
Substituting the expression for the thrust,
$`\boldsymbol{F_{ex}} =\dot{m} \, \boldsymbol{v_{ex}}`$, we finally
obtain the **equation of rocket motion**:

```math
m\, \boldsymbol{\dot{v}} = \dot{m}\, \boldsymbol{v_{ex}} + \boldsymbol{F_G}
```

In the terms of the problem, $`m(t)\, a(t) = k \, v_{ex} - m(t)\, g`$, where
$g = |\boldsymbol{g}|$ and $v_{ex} = |\boldsymbol{v_{ex}}|$. Substituting
$m(t)$, we obtain  $`(m_0 - k\, t)\, a(t) = k\, v_{ex} - (m_0 - k\, t)\, g`$.
Then we find the acceleration as a function of $t$:

```math
a(t) = \frac{k\, v_{ex}}{m_0 - k\, t} - g
```

Next, the velocity can be obtained by a single integration and the position by
a double integration.

The _delta-v budget_ $\Delta{v(t)} = \int_{v_0}^{v} dv = v(t) - v_0$ turns out
to be quite handy to describe spacecraft maneuvers in space. It describes the
total change of the rocket's velocity due to all forces acting on the spacecraft
over the time $t$.

From the equation of rocket motion, we get
$`d\boldsymbol{v} = \frac{\boldsymbol{F_{ex}} + \boldsymbol{F_G}}{m} dt`$.
Substituting $\boldsymbol{F_{ex}} \, dt = \boldsymbol{v_{ex}} \, dm$, results
$`d\boldsymbol{v} = \frac{\boldsymbol{v_{ex}}}{m} dm + \frac{\boldsymbol{F_G}}{m} dt`$.
Then, the velocity change can be calculated by explicit integration:

$`\Delta{\boldsymbol{v}}(t) = \int_{0}^{t}\frac{\boldsymbol{F_{ex}} + \boldsymbol{F_G}}{m} dt'
= \int_{m_0}^{m} \frac{\boldsymbol{v_{ex}}}{m} dm + \int_{0}^{t} \frac{\boldsymbol{F_G}}{m} dt' `$

In the context of the problem, $\boldsymbol{v_{ex}}$ and $\boldsymbol{g}$ are
constants, so the velocity change simplifies into the modified
**rocket equation** with gravity losses:

$`\Delta{\boldsymbol{v}}(t) = \boldsymbol{v_{ex}} \ln\left(\frac{m}{m_0}\right) + \boldsymbol{g}\, t,`$

or in terms of vector magnitudes, keeping in mind that $`\Delta v`$ is always
strictly antiparallel to $\boldsymbol{v_{ex}}$,

```math
\Delta{v}(t) = v_{ex} \ln\left(\frac{m_0}{m} \right) - g \, t.
```

In the context of the problem, results:

```math
v(t) = v_0 - g\, t + v_{ex} \ln\left(\frac{m_0}{m_0 - k\, t}\right), \qquad (1)
```

where $v_0$ is the initial velocity $v(0)$.

Since $\int v(t) dt = r(t) + C$, we obtain the position $r(t)$ (the altitude) as
a primitive of $v(t)$,

$`r(t) = v_0\, t - \frac{1}{2}\, g\, t^2 + \frac{v_{ex}}{k}\, (m_0 - k\, t)\, \left[\ln\left(\frac{m_0 - k\, t}{m_0}\right) - 1 \right]`$.

Then, the change in altitude from the initial time $0$ to the final time $t$
is

$`\Delta r = \int_{0}^{t}\,v(t^{\prime})\, dt^{\prime} = v_0\, t - \frac{1}{2}\, g\, t^2 + \frac{v_{ex}}{k}\, (m_0 - k\, t)\, \left[\ln\left(\frac{m_0 - k\, t}{m_0}\right) - 1 \right] + \frac{v_{ex}}{k}\, m_0,`$

which can be rewritten as

```math
r(t) = r_0 + v_0\, t - \frac{1}{2}\, g\, t^2 + v_{ex} \left[\left(\frac{m_0}{k} - t \right)\, \ln\left(\frac{m_0 - k\, t}{m_0}\right) + t \right], \qquad (2)
```

where $r_0$ is the initial position $r(0)$.

Formulas $1$ and $2$ will be used to compute the velocity and the
altitude, respectively.

### Landing

Termination conditions:

- When the final altitude is 0 or below, the rocket has reached the surface. The
vertical speed at that point determines whether it is a soft landing or a hard
landing (crash).
- When the rocket's movement changes from descending to ascending, it's
necessary to calculate whether the lowest point of the trajectory lies below the
surface, resulting in a landing or a crash.
- When the rocket has exhausted all its propellant, the calculations become
simpler, as the motion then follows the equations of free fall.

The altitude equation involves logarithmic terms, which prevent an exact
analytical solution for the time at which the rocket reaches the lunar surface
(whether it lands or crashes). Therefore, approximate methods must be used to
estimate this time.

One option is to simplify the logarithmic expressions using a Taylor series
expansion and retain only the first few terms. However, a more robust and
accurate approach is to apply numerical root-finding
methods<sup>[5](#cheney-kincaid)</sup>, such as the bisection method, the secant
method, or Newton's method.

Although the secant and Newton methods generally offer faster convergence, they
require verification of convergence criteria and may involve the evaluation or
estimation of derivatives, which introduces additional complexity.
To streamline the analysis and ensure robustness, the bisection method is
adopted in this study.

```text
procedure Bisection(f, a, b, nmax, ε)
integer n, nmax; real a, b, c, fa, fb, fc, error
fa ← f(a)
fb ← f(b)
if sign(fa) = sign(fb) then
    output a, b, fa, fb
    output “function has same signs at a and b”
    return
end if
error ← b − a
for n = 0 to nmax do
    error ← error/2
    c ← a + error
    fc ← f(c)
    output n, c, fc, error
    if |error| < ε then
        output “convergence”
        return
    end if
    if sign(fa) ≠ sign(fc) then
        b ← c
        fb ← fc
    else
        a ← c
        fa ← fc
    end if
end for
end procedure Bisection
```

## Descent control algorithm

Set the initial conditions and landing criteria (the lander must not exceed the
maximum allowable speed during touchdown). Then proceed with the descent
procedure.

Descent procedure:

1. While 'not landed':
    1. If propellant remains, request K.
    1. If propellant has run out, compute a ballistic flight and return
    'landed'.
    1. If propellant runs out during the iteration, adjust 't'.
    1. If a temporary ascent occurs, check whether the lowest point is below the
    surface, and adjust 't'.
    1. If altitude is below the surface or zero, adjust 't' and set the
    iteration state to 'landed'.
    1. Update the lander properties and return the final iteration state.
    1. Display the current state as a line.
1. Display the result of the landing (soft or hard).

## Test examples

- Soft landing (suicide burn):
`0,0,0,0,0,0,0,164.31441,200,200,200,200,200,200,200`

  ```text
  TIME,SECS   ALTITUDE,MILES+FEET   VELOCITY,MPH   FUEL,LBS   FUEL RATE
      0.00            120      0        3600.00     16000.0         
     10.00            109   5016        3636.00     16000.0           0
     20.00             99   4224        3672.00     16000.0           0
     30.00             89   2904        3708.00     16000.0           0
     40.00             79   1056        3744.00     16000.0           0
     50.00             68   3960        3780.00     16000.0           0
     60.00             58   1056        3816.00     16000.0           0
     70.00             47   2904        3852.00     16000.0           0
     80.00             37   1388        3551.81     14356.9         164.31441
     90.00             27   4980        3153.58     12356.9         200
    100.00             19   4076        2724.14     10356.9         200
    110.00             12   4448        2258.67      8356.9         200
    120.00              7   1387        1751.11      6356.9         200
    130.00              3    845        1193.75      4356.9         200
    140.00              0   3622         576.52      2356.9         200
    148.42              0      0           0.69       673.0         200
  ON THE MOON AT 148.42 SECS
  PERFECT LANDING !-(LUCKY)
  ```

- The rocket's movement changes from descending to ascending and the lowest
point of the trajectory lies below the surface, resulting in a hard landing:
`0,0,0,0,0,0,0,164,200,200,200,200,200,200,200`

  ```text
  TIME,SECS   ALTITUDE,MILES+FEET   VELOCITY,MPH   FUEL,LBS   FUEL RATE
      0.00            120      0        3600.00     16000.0         
     10.00            109   5016        3636.00     16000.0           0
     20.00             99   4224        3672.00     16000.0           0
     30.00             89   2904        3708.00     16000.0           0
     40.00             79   1056        3744.00     16000.0           0
     50.00             68   3960        3780.00     16000.0           0
     60.00             58   1056        3816.00     16000.0           0
     70.00             47   2904        3852.00     16000.0           0
     80.00             37   1383        3552.47     14360.0         164
     90.00             27   4965        3154.28     12360.0         200
    100.00             19   4050        2724.90     10360.0         200
    110.00             12   4410        2259.49      8360.0         200
    120.00              7   1337        1752.00      6360.0         200
    130.00              3    781        1194.72      4360.0         200
    140.00              0   3544         577.60      2360.0         200
    147.12              0      0          94.58       936.2         200
  ON THE MOON AT 147.12 SECS
  SORRY,BUT THERE WERE NO SURVIVORS-YOU BLEW IT!
  IN FACT YOU BLASTED A NEW LUNAR CRATER 26.27 FT. DEEP
  ```

- The rocket runs out of propellant and enters ballistic flight:
`200,200,200,200,200,200,200,200`

  ```text
  TIME,SECS   ALTITUDE,MILES+FEET   VELOCITY,MPH   FUEL,LBS   FUEL RATE
      0.00            120      0        3600.00     16000.0         
     10.00            110   2722        3224.43     14000.0         200
     20.00            102    593        2820.94     12000.0         200
     30.00             94   4611        2385.46     10000.0         200
     40.00             88   4720        1912.97      8000.0         200
     50.00             84   1509        1397.14      6000.0         200
     60.00             81    948         829.92      4000.0         200
     70.00             79   3867         200.72      2000.0         200
     80.00             80    712        -504.66         0.0         200
    644.35              0      0        1527.02         0.0           0
  FUEL OUT AT 80.00 SECS
  ON THE MOON AT 644.35 SECS
  SORRY,BUT THERE WERE NO SURVIVORS-YOU BLEW IT!
  IN FACT YOU BLASTED A NEW LUNAR CRATER 424.17 FT. DEEP
  ```

- Ballistic flight from the start: `0,0,0,0,0,0,0,0,0,0,0,0`

```text
TIME,SECS   ALTITUDE,MILES+FEET   VELOCITY,MPH   FUEL,LBS   FUEL RATE
    0.00            120      0        3600.00     16000.0         
   10.00            109   5016        3636.00     16000.0           0
   20.00             99   4224        3672.00     16000.0           0
   30.00             89   2904        3708.00     16000.0           0
   40.00             79   1056        3744.00     16000.0           0
   50.00             68   3960        3780.00     16000.0           0
   60.00             58   1056        3816.00     16000.0           0
   70.00             47   2904        3852.00     16000.0           0
   80.00             36   4224        3888.00     16000.0           0
   90.00             25   5016        3924.00     16000.0           0
  100.00             15      0        3960.00     16000.0           0
  110.00              3   5016        3996.00     16000.0           0
  113.55              0      0        4008.79     16000.0           0
ON THE MOON AT 113.55 SECS
SORRY,BUT THERE WERE NO SURVIVORS-YOU BLEW IT!
IN FACT YOU BLASTED A NEW LUNAR CRATER 1113.55 FT. DEEP
```

## References

1. <a id="storer"></a> Jim Storer's Lunar Lander:
[Lunar Landing Game Related Documents](https://www.cs.brandeis.edu/~storer/LunarLander/LunarLander.html)
1. <a id="martin"></a> Martin C. Martin:
[How I Found A 55 Year Old Bug In The First Lunar Lander Game](https://martincmartin.com/2024/06/14/how-i-found-a-55-year-old-bug-in-the-first-lunar-lander-game/)
1. OpenStax. [9.7 Rocket Propulsion. University Physics Volume 1](https://pressbooks.online.ucf.edu/osuniversityphysics/chapter/9-7-rocket-propulsion/)
1. <a id="walter"></a> Walter, U. (2024). [_Astronautics: The Physics of Space flight_ (Fourth Edition)](https://link.springer.com/book/10.1007/978-3-031-15992-3)
1. <a id="cheney-kincaid"></a> Cheney, E. W., & Kincaid, D. (2008). _Numerical Mathematics and Computing_ (Sixth Etition)
