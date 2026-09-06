---
title: Robotics and Physical AI — Conversation-Ready Learning Path
type: syllabus
status: active
cadence: Friday and Saturday
duration: 12 weeks
created: 2026-09-05
tags:
  - robotics
  - physical-ai
  - learning-path
---

# Robotics and Physical AI — Conversation-Ready Learning Path

## Purpose

Build enough technical and commercial fluency to have useful conversations about robotics and Physical AI with VCs, founders, practitioners, and engineers.

This is not an engineering qualification. The target is to be able to:

- explain how a robot closes the loop from sensing to action;
- trace a capability claim through hardware, data, model, control, and deployment constraints;
- compare classical robotics, learned policies, and hybrid systems without treating them as mutually exclusive;
- ask questions that reveal whether a demo can become a reliable and economical product;
- recognize the important equations, metrics, and architectural choices without needing to derive everything from scratch.

**Default commitment:** 3 hours on Friday + 4 hours on Saturday for 12 weeks (about 84 hours). If a weekend is busy, complete the Friday core and the Saturday synthesis; treat coding as optional.

Track completion and questions in `robotics-learning-log.md` in this folder.

## The organizing model

Use one loop throughout the course:

> **Goal → sensing → perception → state estimation/world model → planning/policy → control → actuation → physical outcome → feedback/data**

Three constraints sit around that loop:

1. **Physics and time:** actions must be stable, safe, and fast enough for a changing world.
2. **Uncertainty and distribution shift:** sensors are noisy and environments do not match training data.
3. **Economics and operations:** reliability, throughput, integration, service, and utilization determine whether a robot creates value.

This combines Cornell's systems sequence—ROS, kinematics, estimation, planning, and control—with Berkeley's stronger treatment of rigid-body motion, vision, Jacobians, and dynamics. Princeton supplies a particularly approachable bridge from classical autonomy to modern robot learning: planning, quadrotor dynamics and control, estimation/SLAM, imitation learning, diffusion, VLAs, RL, world models, and robotics' societal implications. The vault adds the commercial layer: data engines, foundation models, cross-embodiment transfer, industrialization, and deployment.

## Weekly rhythm

### Friday — understand the mechanism (3 hours)

- **20 min:** retrieve last week's concepts from memory; no notes.
- **70 min:** watch/read the core academic material.
- **40 min:** work one small numerical, diagramming, or code example.
- **30 min:** make a one-page mechanism note: inputs, transformation, outputs, assumptions, failure modes.
- **20 min:** explain the topic aloud in plain English and record the gaps.

### Saturday — connect it to Physical AI (4 hours)

- **45 min:** read one modern system, paper, or vault note.
- **75 min:** complete the hands-on exercise or inspect a working implementation.
- **45 min:** analyze one company, robot, or demo through the week's concept.
- **45 min:** write the weekly conversation brief.
- **30 min:** conduct a mock conversation: one VC question, one founder question, one engineer question.

### Definition of “learned”

A topic is complete when you can do four things without notes:

1. **Explain** it in two minutes.
2. **Trace** where it sits in the closed loop.
3. **Compare** two plausible approaches and name the tradeoff.
4. **Question** a product claim using a relevant metric or failure mode.

Do not optimize for proofs, memorized notation, or completing every university assignment.

## 12-week syllabus

### Week 1 — What a robot is: the full stack and the closed loop

**Mechanisms:** embodiment, degrees of freedom, observations, state, actions, policies, open-loop vs. closed-loop behavior, autonomy vs. automation, latency.

**Friday core**

- Watch Princeton Lecture 1, *Introduction to Robotics*, as the opening orientation.
- Read the Cornell course overview and its full schedule.
- Read the Interlatent first-principles essay. Capture its central abstraction: a robot policy maps observations to actions, but must operate under real-time physical constraints.
- Draw the complete loop for three systems: an industrial arm, an autonomous mobile robot, and a humanoid.

**Saturday application**

- Read `[[Twitter Bookmarks/Notes/The Robotics Stack Is a Moving Constraint]]` and `[[Clippings/Robotics Levels of Autonomy]]`.
- Pick one public robot demo. Label what is visible, what must exist behind the demo, and what evidence is missing.

**Output:** a one-page “robotics stack in my own words” map.

**Conversation test:** Why is robotics not simply “AI plus a body,” and why can a technically impressive demo still be commercially weak?

---

### Week 2 — Coordinate frames and rigid-body motion

**Mechanisms:** vectors and matrices, reference frames, rotations, translations, homogeneous transforms, SO(3), SE(3), Euler angles, axis-angle, quaternions.

**Friday core**

- Berkeley EECS C106A Weeks 1–2, selectively: rotations, rigid transformations, and the intuition behind SO(3)/SE(3).
- Modern Robotics Chapters 2–3 videos; use the book only to clarify gaps.
- By hand, transform a point from camera frame → robot-base frame → world frame.

**Saturday application**

- Use a small Python notebook or Robotics Toolbox to rotate and translate a simple 3D point or coordinate frame.
- Explain why calibration errors propagate through a robot stack.

**Output:** a visual “frames and transforms” note with one worked example.

**Conversation test:** What goes wrong when a camera, gripper, and world model disagree about coordinate frames?

---

### Week 3 — Kinematics, Jacobians, and dexterity

**Mechanisms:** joints, configuration space vs. task space, forward and inverse kinematics, Jacobians, singularities, workspace, redundancy, manipulability.

**Friday core**

- Cornell robot-arm kinematics lectures in the schedule, then Berkeley Weeks 4–5 and 8–9.
- Modern Robotics Chapters 4–6 videos, selectively.
- Sketch a 2-link arm and calculate or inspect its reachable workspace and one unreachable target.

**Saturday application**

- Use an interactive arm model or Robotics Toolbox to compare forward and inverse kinematics.
- Read a humanoid or manipulation demo and ask whether its limitation is semantic planning, reachability, singularity, collision, or contact.

**Output:** a comparison card: FK vs. IK vs. Jacobian control.

**Conversation test:** Why does “the model knows which object to pick” say almost nothing about whether the robot can pick it?

---

### Week 4 — Dynamics and feedback control

**Mechanisms:** position, velocity, acceleration, force and torque, inertia, friction, dynamics, stability, feedback, PID, LQR, MPC, control frequency.

**Friday core**

- Berkeley Weeks 10–13 for the conceptual arc from Lagrangian dynamics to control.
- Cornell controls block for PID, state-space, LQR, and MPC.
- Use Princeton Lectures 4–7 as the accessible worked sequence: planar and 3D quadrotor dynamics, linearization, stability, PD control, and LQR.
- MIT Underactuated Robotics: introduction and simple pendulum only; focus on why dynamics matter.

**Saturday application**

- Tune a simulated PID controller or inspect a pendulum/cart-pole example. Intentionally create overshoot, oscillation, and sluggish response.
- Relate high-level model latency to low-level control-loop frequency.

**Output:** a “planning is not control” memo with one failure trace.

**Conversation test:** Why can a 90%-accurate policy be unusable if its action timing or low-level controller is poor?

---

### Week 5 — Uncertainty, state estimation, and SLAM

**Mechanisms:** probability as belief, sensor noise, Bayesian filtering, Kalman filters, particle filters, localization, mapping, SLAM, observability, sensor fusion.

**Friday core**

- Cornell state-estimation block: Bayesian, Kalman, and particle filtering.
- Use Princeton Lectures 10–16 for the continuous sequence from camera models and optical flow through filtering, localization, mapping, and SLAM.
- Use *Probabilistic Robotics* as a reference, not a cover-to-cover assignment.
- Work through a one-dimensional noisy-position example: prediction, measurement, updated estimate.

**Saturday application**

- Compare camera, lidar, radar, IMU, encoders, force/torque, and tactile sensing by information provided, failure conditions, latency, and cost.
- Draw how a mobile robot can be confidently wrong about its location.

**Output:** a sensor-fusion tradeoff table and an uncertainty failure tree.

**Conversation test:** What evidence shows that a robot knows where it is, rather than merely recognizing objects?

---

### Week 6 — Planning, navigation, and task decomposition

**Mechanisms:** search, A*, configuration-space obstacles, sampling-based planning, RRT, trajectory optimization, collision checking, behavior trees, task planning vs. motion planning.

**Friday core**

- Cornell motion-planning block: graph and sampling-based methods.
- Use Princeton Lectures 2–3 for graph search and RRT intuition; sample Lectures 8–9 to see how dynamics constraints lead to differential flatness, trajectory optimization, and time-varying feedback.
- Skim Steven LaValle's free *Planning Algorithms* chapters on discrete search and sampling-based planning.
- Draw the configuration-space view of a simple obstacle problem.

**Saturday application**

- Implement or interact with A* on a grid and compare it with the intuition of RRT in continuous, high-dimensional space.
- Decompose “clear a dinner table” into task planning, motion planning, grasping, control, and recovery.

**Output:** one task-to-motion decomposition plus an A* vs. RRT comparison.

**Conversation test:** Where does an LLM planner help, and where does it need classical constraints, collision checking, or a controller?

---

### Week 7 — ROS 2 and the anatomy of a production robot

**Mechanisms:** nodes, topics, services, actions, messages, transforms (`tf2`), URDF, launch, logs, bags/replay, real-time vs. non-real-time components.

**Friday core**

- Complete the official ROS 2 beginner sequence through nodes, topics, services, parameters, and actions.
- Study one URDF and identify links, joints, frames, and sensors.
- Map ROS concepts onto the closed-loop diagram from Week 1.

**Saturday application**

- Run `turtlesim` or a browser/cloud equivalent; inspect topic flow and record/replay if setup permits.
- Read `[[Twitter Bookmarks/Articles/Robots need a nervous system]]` and `[[Twitter Bookmarks/Articles/What Software Engineers Misunderstand About Robotics]]`.

**Output:** a system architecture diagram showing data rates, boundaries, and likely failure points.

**Conversation test:** Which parts of this system must be deterministic and local, and which can be slower, learned, or cloud-assisted?

---

### Week 8 — Perception, grasping, and contact

**Mechanisms:** image formation, depth, detection, segmentation, pose estimation, point clouds, visual servoing, grasp pose, tactile sensing, contact-rich manipulation.

**Friday core**

- Berkeley vision block, Weeks 6–7, for image formation, features, correspondence, and two-view geometry.
- Study the distinction between object recognition, 6D pose estimation, and actionable affordances.
- Trace a pick-and-place task from pixels to gripper closure.

**Saturday application**

- Inspect several success and failure videos. Classify each failure: perception, estimation, planning, grasp selection, force control, or recovery.
- Compare vision-only and vision-plus-tactile approaches.

**Output:** an annotated perception-to-grasp pipeline.

**Conversation test:** Why are transparent, deformable, reflective, occluded, and unfamiliar objects still revealing tests?

---

### Week 9 — Robot learning: imitation, reinforcement, and diffusion policies

**Mechanisms:** demonstrations, behavior cloning, covariate shift, dataset aggregation, reward design, offline vs. online RL, action chunks, multimodal actions, diffusion/flow policies.

**Friday core**

- Use the ETH Zurich Robot Learning course as the spine: imitation learning, reinforcement learning, visual control, and manipulation.
- Use Princeton Lectures 17–19 as the concise first pass through imitation learning, generative policies, data augmentation, and DAgger.
- Read the Diffusion Policy abstract, system diagrams, and evaluation sections; do not chase every derivation.
- Compare hand-coded control, behavior cloning, RL, and a hybrid system on one task.

**Saturday application**

- Use Hugging Face LeRobot documentation to inspect the structure of a robot dataset and a pretrained policy.
- Identify observation fields, action representation, control horizon, training distribution, and evaluation protocol.

**Output:** a method-selection matrix: scripted vs. planning/control vs. imitation vs. RL.

**Conversation test:** When does more demonstration data fix a robot, and when is the problem actually embodiment, observability, latency, or evaluation?

---

### Week 10 — VLAs, robot foundation models, and the data pyramid

**Mechanisms:** vision-language-action models, semantic planning plus fast action models, cross-embodiment transfer, tokenized vs. continuous actions, web/human/synthetic/robot data, sim-to-real, fine-tuning.

**Friday core**

- Use Princeton Lectures 20–23 as the first pass through VLAs, reinforcement learning, and world models.
- Read `[[Clippings/GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]]`.
- Read the abstracts, architecture diagrams, data mixture, and limitations for RT-1/RT-2, Open X-Embodiment/RT-X, and one current open VLA in LeRobot.
- Revisit the Interlatent essay's fast/slow architecture and inference-time constraint.

**Saturday application**

- Read `[[Twitter Bookmarks/Articles/The Data Problem Behind Physical AI Is Changing]]` and `[[Twitter Bookmarks/Notes/Mapping Robot Foundation Models Against Five Bottlenecks]]`.
- Build an evidence table for one model: tasks, embodiments, training data, baseline, success metric, generalization claim, latency, and missing evidence.

**Output:** a two-page “how to evaluate an RFM/VLA claim” brief.

**Conversation test:** What exactly is generalizing—objects, tasks, environments, embodiments, or merely language instructions?

---

### Week 11 — Hardware, safety, reliability, and deployment economics

**Mechanisms:** actuators, motors, gearboxes, encoders, torque and payload, reach, speed, battery/runtime, thermal limits, calibration, wear, safety, teleoperation, fleet operations, uptime.

**Friday core**

- Learn component roles and the tradeoffs among torque, speed, precision, compliance, efficiency, weight, and cost.
- Read `[[Twitter Bookmarks/Notes/The Robotics Stack Is a Moving Constraint]]` again from an industrialization lens.
- Learn the vocabulary of functional safety, e-stops, guarding, collaborative operation, and failure recovery. Standards are reference material, not an assignment.

**Saturday application**

- Read `[[Clippings/Robotics Levels of Autonomy]]` and `[[Twitter Bookmarks/Articles/What Software Engineers Misunderstand About Robotics]]`.
- Build a simple deployment model with robot price or lease, integration, utilization, throughput, human supervision ratio, uptime, maintenance, and payback.
- Distinguish technical success rate from useful throughput and customer ROI.

**Output:** a deployment scorecard for one robotics company.

**Conversation test:** What intervention rate, uptime, throughput, and payback would turn this pilot into a repeatable deployment?

---

### Week 12 — Markets, moats, and the capstone conversation brief

**Mechanisms:** value-chain position, horizontal foundation models vs. vertical applications, data flywheels, deployment learning, manufacturing scale, service network, system integration, sales cycle, gross margin, robots-as-a-service.

**Friday core**

- Watch Princeton Lecture 24 on robotics, jobs, ethics, and law before forming the market thesis.
- Read `[[Twitter Bookmarks/Articles/How to Think About the Robotics Market]]`, `[[Twitter Bookmarks/Articles/Where Does Value Accrue in Robotics]]`, and `[[Twitter Bookmarks/Notes/RoboStrategy Shareholder Letter - No ChatGPT Moment for Robotics]]`.
- Compare the conflicting theses: intelligence bottleneck vs. data bottleneck vs. hardware supply vs. integration/reliability bottleneck.
- State which constraint dominates for three different categories: industrial arms, warehouse mobile robots, and general-purpose humanoids.

**Saturday capstone**

- Select one company or robot and prepare a 5–7 minute briefing.
- Include: job-to-be-done, stack diagram, classical/learned components, data loop, evidence of generalization, reliability, deployment economics, competitive position, biggest unknown, and three diligence questions.
- Deliver it aloud twice: once to a technically curious VC and once to a robotics engineer. Remove claims you cannot defend.

**Output:** a five-page maximum capstone memo plus a one-page conversation cheat sheet.

**Conversation test:** What must become true—technically and economically—for this company to scale by 10×?

## The weekly conversation brief

Keep each brief to one page:

1. **Mechanism:** What changed inside the loop this week?
2. **Tradeoff:** What do two competing approaches optimize?
3. **Evidence:** What result would convince a skeptical engineer?
4. **Failure mode:** How does the system fail outside the demo?
5. **Business implication:** Which cost, moat, or market constraint follows?
6. **Three questions:** one each for a founder, engineer, and investor.

## Company/demo diligence template

| Layer | Questions worth asking |
|---|---|
| Customer/job | What job is being completed, in which environment, and what is the incumbent process? |
| Capability | What tasks, objects, environments, and embodiments are in-distribution? What is genuinely new? |
| Autonomy | What is scripted, planned, learned, teleoperated, or manually recovered? |
| Data | Who generates the data, at what cost, and does deployment create a compounding data advantage? |
| Evaluation | Number of trials? Uncut runs? Success definition? Edge cases? Baseline? |
| Runtime | End-to-end latency, control rate, compute location, and behavior when connectivity fails? |
| Reliability | Uptime, interventions per hour, mean time to recovery, maintenance, calibration drift? |
| Economics | Fully loaded cost, integration, utilization, throughput, supervision, payback, gross margin? |
| Scale | What breaks at 10, 100, and 10,000 robots: supply, calibration, service, data, safety, or demand? |
| Moat | Model, proprietary data, hardware, workflow integration, distribution, service network, or switching cost? |

## Core resource hierarchy

### Primary spine

- [Princeton ROB 345/549 Introduction to Robotics](https://irom-lab.princeton.edu/intro-to-robotics/) and its [video channel](https://www.youtube.com/@intro-to-robo): the most compact end-to-end bridge in this plan, with public notes, slides, assignments, projects, and 24 lectures spanning planning, control, SLAM, modern robot learning, VLAs, world models, and societal questions.
- [Cornell CS 4750/5750 Foundations of Robotics](https://www.cs.cornell.edu/courses/cs5750/2025fa/) and its [course schedule](https://www.cs.cornell.edu/courses/cs5750/2025fa/schedule/): system-level sequence, state estimation, planning, and controls.
- [Berkeley EECS C106A/206A Fall 2025](https://pages.github.berkeley.edu/EECS-106/fa25-site/): rigid-body motion, kinematics, vision, Jacobians, dynamics, controls, and applied labs.
- [Modern Robotics](https://hades.mech.northwestern.edu/index.php/Modern_Robotics): free educational preprint, videos, practice exercises, and readable code.
- [Interlatent: Modern AI Robotics from First Principles](https://interlatent.com/blog/interlatent-modern-ai-robotics-first-principles): observation-to-action framing, data scaling, and the real-time fast/slow policy architecture.

### Use selectively

- [Princeton's public assignment repository](https://github.com/Princeton-Introduction-to-Robotics/F2023): Jupyter assignments and a vision-navigation final project. Use the software portions selectively; the current course's Crazyflie hardware components are optional for this learning goal.
- [MIT Underactuated Robotics](https://underactuated.mit.edu/): dynamics, optimization, and control intuition. It is intentionally deeper than this plan requires.
- [ROS 2 documentation](https://docs.ros.org/): official beginner tutorials and system concepts. Follow one stable distribution consistently rather than mixing tutorials.
- [Hugging Face LeRobot](https://huggingface.co/docs/lerobot/index): datasets, imitation/RL policies, simulation, and open model inspection.
- [Planning Algorithms](https://lavalle.pl/planning/): free reference for graph search and sampling-based planning.
- *Probabilistic Robotics* by Thrun, Burgard, and Fox: reference for estimation, localization, and SLAM.
- The ETH Zurich Robot Learning course referenced in `[[Twitter Bookmarks/Notes/ETH Zurich Robot Learning Course as a Roadmap Into the Field]]`: the learning-based continuation after classical foundations.

### Ongoing industry signal

- Use the vault topic `[[01 Topics/Robotics, Physical AI & World Models]]` as the home map.
- Once per week, inspect one recent paper, deployment report, or uncut demo—not a stream of announcements.
- Prefer primary sources: papers, technical reports, product documentation, customer case studies, safety disclosures, and measured fleet results.
- Treat market estimates and company-authored benchmarks as hypotheses until the method and denominator are visible.

## What to skip on the first pass

- formal proofs of Lie group properties;
- long symbolic dynamics derivations;
- implementing SLAM, a physics engine, or a neural policy from scratch;
- exhaustive ROS package knowledge;
- buying hardware before Week 12;
- buying the Princeton course's Crazyflie drone, radio, flow deck, or FPV camera merely to follow the lectures;
- daily robotics-news consumption;
- accepting a polished demo, aggregate success rate, or TAM slide as deployment evidence.

## Milestones

### End of Week 4 — mechanics fluency

Explain frames, kinematics, dynamics, planning, and control as distinct parts of a system. Diagnose a simple failure without saying only “the AI got it wrong.”

### End of Week 8 — systems fluency

Trace a task from sensor input to physical contact. Read a robot architecture diagram and identify timing, estimation, perception, planning, and integration risks.

### End of Week 12 — Physical AI conversation fluency

Evaluate a foundation-model or robotics startup claim across capability, generalization, data, latency, reliability, deployment economics, and defensibility. Hold a 20-minute conversation while asking specific, non-performative questions.

## Self-assessment rubric

Score each dimension from 0–2 after Weeks 4, 8, and 12.

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| Closed-loop explanation | vague labels | correct components | explains interactions and timing |
| Technical vocabulary | repeats terms | defines terms | uses terms to reason about tradeoffs |
| Failure diagnosis | guesses | identifies a layer | proposes evidence to distinguish causes |
| Model evaluation | accepts headline metric | reads setup and baseline | tests generalization and hidden assistance |
| Deployment judgment | focuses on capability | mentions reliability/cost | connects metrics to repeatable customer ROI |
| Conversation quality | asks generic questions | asks domain questions | adapts questions to stakeholder and evidence |

**Graduation threshold:** 9/12 or higher, plus a capstone briefing you can deliver without notes.

## After the core

Choose one four-week branch only after Week 12:

- **Manipulation and humanoids:** contact, dexterity, teleoperation, diffusion/VLA policies.
- **Mobile robots and autonomy:** SLAM, navigation, fleet orchestration, autonomy operations.
- **Control and locomotion:** nonlinear dynamics, trajectory optimization, RL, sim-to-real.
- **Robotics investing:** category maps, deployment economics, manufacturing/supply chain, diligence.

The calendar-blocking step can convert this syllabus into actual Friday/Saturday events once the preferred start date and time windows are known.
