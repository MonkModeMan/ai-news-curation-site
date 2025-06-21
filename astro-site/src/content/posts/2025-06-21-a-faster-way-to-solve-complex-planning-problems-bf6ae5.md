---
title: A faster way to solve complex planning problems
description: By eliminating redundant computations, a new data-driven method can streamline
  processes like scheduling trains, routing delivery drivers, or assigning airline
  crews.
summary: By eliminating redundant computations, a new data-driven method can streamline
  processes like scheduling trains, routing
pubDate: Wed, 16 Apr 2025 00:00:00 -0400
source: MIT
tags:
- mit
- ai
url: https://news.mit.edu/2025/faster-way-solve-complex-planning-problems-0416
---

When some commuter trains arrive at the end of the line, they must travel to a switching platform to be turned around so they can depart the station later, often from a different platform than the one at which they arrived.
Engineers use software programs called algorithmic solvers to plan these movements, but at a station with thousands of weekly arrivals and departures, the problem becomes too complex for a traditional solver to unravel all at once.
Using machine learning, MIT researchers have developed an improved planning system that reduces the solve time by up to 50 percent and produces a solution that better meets a user’s objective, such as on-time train departures. The new method could also be used for efficiently solving other complex logistical problems, such as scheduling hospital staff, assigning airline crews, or allotting tasks to factory machines.
Engineers often break these kinds of problems down into a sequence of overlapping subproblems that can each be solved in a feasible amount of time. But the overlaps cause many decisions to be needlessly recomputed, so it takes the solver much longer to reach an optimal solution.
The new, artificial intelligence-enhanced approach learns which parts of each subproblem should remain unchanged, freezing those variables to avoid redundant computations. Then a traditional algorithmic solver tackles the remaining variables.
“Often, a dedicated team could spend months or even years designing an algorithm to solve just one of these combinatorial problems. Modern deep learning gives us an opportunity to use new advances to help streamline the design of these algorithms. We can take what we know works well, and use AI to accelerate it,” says Cathy Wu, the Thomas D. and Virginia W. Cabot Career Development Associate Professor in Civil and Environmental Engineering (CEE) and the Institute for Data, Systems, and Society (IDSS) at MIT, and a member of the Laboratory for Information and Decision Systems (LIDS).
She is joined on the paper by lead author Sirui Li, an IDSS graduate student; Wenbin Ouyang, a CEE graduate student; and Yining Ma, a LIDS postdoc. The research will be presented at the International Conference on Learning Representations.
Eliminating redundance
One motivation for this research is a practical problem identified by a master’s student Devin Camille Wilkins in Wu’s entry-level transportation course. The student wanted to apply reinforcement learning to a real train-dispatch problem at Boston’s North Station. The transit organization needs to assign many trains to a limited number of platforms where they can be turned around well in advance of their arrival at the station.
This turns out to be a very complex combinatorial scheduling problem — the exact type of problem Wu’s lab has spent the past few years working on.
When faced with a long-term problem that involves assigning a limited set of resources, like factory tasks, to a group of machines, planners often frame the problem as Flexible Job Shop Scheduling.
In Flexible Job Shop Scheduling, each task needs a different amount of time to complete, but tasks can be assigned to any machine. At the same time, each task is composed of operations that must be performed in the correct order.
Such problems quickly become too large and unwieldy for traditional solvers, so users can employ rolling horizon optimization (RHO) to break the problem into manageable chunks that can be solved faster.
With RHO, a user assigns an initial few tasks to machines in a fixed planning horizon, perhaps a four-hour time window. Then, they execute the first task in that sequence and shift the four-hour planning horizon forward to add the next task, repeating the process until the entire problem is solved and the final schedule of task-machine assignments is created.
A planning horizon should be longer than any one task’s duration, since the solution will be better if the algorithm also considers tasks that will be coming up.
But when the planning horizon advances, this creates some overlap with operations in the previous planning horizon. The algorithm already came up with preliminary solutions to these overlapping operations.
“Maybe these preliminary solutions are good and don’t need to be computed again, but maybe they aren’t good. This is where machine learning comes in,” Wu explains.
For their technique, which they call learning-guided rolling horizon optimization (L-RHO), the researchers teach a machine-learning model to predict which operations, or variables, should be recomputed when the planning horizon rolls forward.
L-RHO requires data to train the model, so the researchers solve a set of subproblems using a classical algorithmic solver. They took the best solutions — the ones with the most operations that don’t need to be recomputed — and used these as training data.
Once trained, the machine-learning model receives a new subproblem it hasn’t seen before and predicts which operations should not be recomputed. The remaining operations are fed back into the algorithmic solver, which executes the task, recomputes these operations, and moves the planning horizon forward. Then the loop starts all over again.
“If, in hindsight, we didn’t need to reoptimize them, then we can remove those variables from the problem. Because these problems grow exponentially in size, it can be quite advantageous if we can drop some of those variables,” she adds.
An adaptable, scalable approach
To test their approach, the researchers compared L-RHO to several base algorithmic solvers, specialized solvers, and approaches that only use machine learning. It outperformed them all, reducing solve time by 54 percent and improving solution quality by up to 21 percent.
In addition, their method continued to outperform all baselines when they tested it on more complex variants of the problem, such as when factory machines break down or when there is extra train congestion. It even outperformed additional baselines the researchers created to challenge their solver.
“Our approach can be applied without modification to all these different variants, which is really what we set out to do with this line of research,” she says.
L-RHO can also adapt if the objectives change, automatically generating a new algorithm to solve the problem — all it needs is a new training dataset.
In the future, the researchers want to better understand the logic behind their model’s decision to freeze some variables, but not others. They also want to integrate their approach into other types of complex optimization problems like inventory management or vehicle routing.
This work was supported, in part, by the National Science Foundation, MIT’s Research Support Committee, an Amazon Robotics PhD Fellowship, and MathWorks.