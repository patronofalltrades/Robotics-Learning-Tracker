import { CurriculumResource, CurriculumWeek, validateCurriculum } from "./types";

const resource = (id: string, title: string, source: string, kind: CurriculumResource["kind"], url?: string): CurriculumResource => ({ id, title, source, kind, url });
const activity = (id: string, title: string, detail: string, session: "friday" | "saturday", optional = false) => ({ id, title, detail, session, optional });

export const resources: CurriculumResource[] = [
  resource("princeton-intro", "ROB 345/549 Introduction to Robotics", "Princeton / IROM Lab", "course", "https://irom-lab.princeton.edu/intro-to-robotics/"),
  resource("princeton-youtube", "Introduction to Robotics video channel", "Princeton", "video", "https://www.youtube.com/@intro-to-robo"),
  resource("cornell-foundations", "CS 4750/5750 Foundations of Robotics", "Cornell", "course", "https://www.cs.cornell.edu/courses/cs5750/2025fa/"),
  resource("cornell-schedule", "Course schedule", "Cornell", "course", "https://www.cs.cornell.edu/courses/cs5750/2025fa/schedule/"),
  resource("berkeley-c106", "EECS C106A/206A Fall 2025", "UC Berkeley", "course", "https://pages.github.berkeley.edu/EECS-106/fa25-site/"),
  resource("modern-robotics", "Modern Robotics", "Northwestern", "book", "https://hades.mech.northwestern.edu/index.php/Modern_Robotics"),
  resource("interlatent", "Modern AI Robotics from First Principles", "Interlatent", "essay", "https://interlatent.com/blog/interlatent-modern-ai-robotics-first-principles"),
  resource("robotics-stack", "The Robotics Stack Is a Moving Constraint", "Vault · Twitter Bookmarks / Notes", "vault"),
  resource("robotics-autonomy", "Robotics Levels of Autonomy", "Vault · Clippings", "vault"),
  resource("princeton-assignments", "Public assignment repository", "Princeton Introduction to Robotics", "repository", "https://github.com/Princeton-Introduction-to-Robotics/F2023"),
  resource("mit-underactuated", "Underactuated Robotics", "MIT", "course", "https://underactuated.mit.edu/"),
  resource("ros2", "ROS 2 documentation", "Open Robotics", "docs", "https://docs.ros.org/"),
  resource("lerobot", "LeRobot documentation", "Hugging Face", "docs", "https://huggingface.co/docs/lerobot/index"),
  resource("planning-algorithms", "Planning Algorithms", "Steven LaValle", "book", "https://lavalle.pl/planning/"),
  resource("prob-robotics", "Probabilistic Robotics", "Thrun, Burgard, and Fox", "book"),
  resource("eth-robot-learning", "Robot Learning course roadmap", "ETH Zurich · Vault / Notes", "course"),
  resource("robots-nervous-system", "Robots need a nervous system", "Vault · Twitter Bookmarks / Articles", "vault"),
  resource("software-engineers-robotics", "What Software Engineers Misunderstand About Robotics", "Vault · Twitter Bookmarks / Articles", "vault"),
  resource("diffusion-policy", "Diffusion Policy", "Paper", "paper"),
  resource("groot", "GR00T N1: An Open Foundation Model for Generalist Humanoid Robots", "Vault · Clippings", "vault"),
  resource("rt1-rt2", "RT-1 / RT-2", "Paper family", "paper"),
  resource("open-x", "Open X-Embodiment / RT-X", "Paper family", "paper"),
  resource("data-problem", "The Data Problem Behind Physical AI Is Changing", "Vault · Twitter Bookmarks / Articles", "vault"),
  resource("rfm-bottlenecks", "Mapping Robot Foundation Models Against Five Bottlenecks", "Vault · Twitter Bookmarks / Notes", "vault"),
  resource("market-robotics", "How to Think About the Robotics Market", "Vault · Twitter Bookmarks / Articles", "vault"),
  resource("value-accrue", "Where Does Value Accrue in Robotics", "Vault · Twitter Bookmarks / Articles", "vault"),
  resource("no-chatgpt", "RoboStrategy Shareholder Letter - No ChatGPT Moment for Robotics", "Vault · Twitter Bookmarks / Notes", "vault"),
  resource("robotics-topic", "Robotics, Physical AI & World Models", "Vault · Topics", "vault"),
];

const byId = (ids: string[]) => ids.map((id) => resources.find((item) => item.id === id)!).filter(Boolean);

export const curriculum: CurriculumWeek[] = [
  {
    id: "week-1", number: 1, title: "What a robot is: the full stack and the closed loop",
    mechanisms: ["embodiment", "degrees of freedom", "observations", "state", "actions", "policies", "open-loop vs. closed-loop behavior", "autonomy vs. automation", "latency"],
    friday: { duration: "3 hours", summary: "Orient to the robot as a closed-loop system and name the layers behind a demo.", activities: [
      activity("w1-f1", "Watch Princeton Lecture 1", "Introduction to Robotics as the opening orientation.", "friday"),
      activity("w1-f2", "Read Cornell overview and schedule", "Read the course overview and full schedule.", "friday"),
      activity("w1-f3", "Read Interlatent first principles", "Capture the observation-to-action abstraction and real-time physical constraints.", "friday"),
      activity("w1-f4", "Draw three complete loops", "Map an industrial arm, autonomous mobile robot, and humanoid.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Connect the stack to a public demo and practice asking what is hidden.", activities: [
      activity("w1-s1", "Read the vault notes", "Read The Robotics Stack Is a Moving Constraint and Robotics Levels of Autonomy.", "saturday"),
      activity("w1-s2", "Audit one public robot demo", "Label what is visible, what must exist behind it, and the missing evidence.", "saturday"),
    ]},
    output: "A one-page “robotics stack in my own words” map.",
    conversationTest: "Why is robotics not simply “AI plus a body,” and why can a technically impressive demo still be commercially weak?",
    resources: byId(["princeton-intro", "princeton-youtube", "cornell-foundations", "cornell-schedule", "interlatent", "robotics-stack", "robotics-autonomy"]),
  },
  {
    id: "week-2", number: 2, title: "Coordinate frames and rigid-body motion",
    mechanisms: ["vectors and matrices", "reference frames", "rotations", "translations", "homogeneous transforms", "SO(3)", "SE(3)", "Euler angles", "axis-angle", "quaternions"],
    friday: { duration: "3 hours", summary: "Build an intuition for rigid motion and transforms across frames.", activities: [
      activity("w2-f1", "Study Berkeley Weeks 1–2", "Selectively cover rotations, rigid transformations, and SO(3)/SE(3).", "friday"),
      activity("w2-f2", "Watch Modern Robotics Chapters 2–3", "Use the book only to clarify gaps.", "friday"),
      activity("w2-f3", "Work one frame transform", "Transform a point camera → robot base → world by hand.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Make the math tangible and trace calibration error.", activities: [
      activity("w2-s1", "Rotate and translate a 3D point", "Use a small Python notebook or Robotics Toolbox.", "saturday", true),
      activity("w2-s2", "Explain calibration propagation", "Name how frame disagreement travels through a robot stack.", "saturday"),
    ]},
    output: "A visual “frames and transforms” note with one worked example.", conversationTest: "What goes wrong when a camera, gripper, and world model disagree about coordinate frames?",
    resources: byId(["berkeley-c106", "modern-robotics"]),
  },
  {
    id: "week-3", number: 3, title: "Kinematics, Jacobians, and dexterity",
    mechanisms: ["joints", "configuration space vs. task space", "forward and inverse kinematics", "Jacobians", "singularities", "workspace", "redundancy", "manipulability"],
    friday: { duration: "3 hours", summary: "Separate what a robot can reach from what a model intends.", activities: [
      activity("w3-f1", "Study Cornell kinematics", "Use the robot-arm kinematics lectures in the schedule.", "friday"),
      activity("w3-f2", "Study Berkeley Weeks 4–5 and 8–9", "Focus on kinematics, Jacobians, and dexterity.", "friday"),
      activity("w3-f3", "Watch Modern Robotics Chapters 4–6", "Selectively use the videos and practice material.", "friday"),
      activity("w3-f4", "Sketch a 2-link arm", "Calculate or inspect reachable workspace and one unreachable target.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Use an arm model to diagnose manipulation constraints.", activities: [
      activity("w3-s1", "Compare FK and IK", "Use an interactive arm model or Robotics Toolbox.", "saturday"),
      activity("w3-s2", "Diagnose one manipulation demo", "Classify the limitation: semantics, reachability, singularity, collision, or contact.", "saturday"),
    ]},
    output: "A comparison card: FK vs. IK vs. Jacobian control.", conversationTest: "Why does “the model knows which object to pick” say almost nothing about whether the robot can pick it?",
    resources: byId(["cornell-schedule", "berkeley-c106", "modern-robotics"]),
  },
  {
    id: "week-4", number: 4, title: "Dynamics and feedback control",
    mechanisms: ["position", "velocity", "acceleration", "force and torque", "inertia", "friction", "dynamics", "stability", "feedback", "PID", "LQR", "MPC", "control frequency"],
    friday: { duration: "3 hours", summary: "Follow the arc from dynamics to stable control.", activities: [
      activity("w4-f1", "Study Berkeley Weeks 10–13", "Follow the conceptual arc from Lagrangian dynamics to control.", "friday"),
      activity("w4-f2", "Study Cornell controls block", "Cover PID, state-space, LQR, and MPC.", "friday"),
      activity("w4-f3", "Watch Princeton Lectures 4–7", "Use the worked quadrotor dynamics, linearization, PD, and LQR sequence.", "friday"),
      activity("w4-f4", "Read MIT introduction and simple pendulum", "Focus on why dynamics matter, not derivation depth.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Observe how timing and controller quality turn a policy into behavior.", activities: [
      activity("w4-s1", "Tune a simulated controller", "Intentionally create overshoot, oscillation, and sluggish response.", "saturday"),
      activity("w4-s2", "Trace latency to control frequency", "Relate high-level model latency to low-level loop frequency.", "saturday"),
    ]},
    output: "A “planning is not control” memo with one failure trace.", conversationTest: "Why can a 90%-accurate policy be unusable if its action timing or low-level controller is poor?",
    resources: byId(["berkeley-c106", "cornell-schedule", "princeton-intro", "mit-underactuated"]),
  },
  {
    id: "week-5", number: 5, title: "Uncertainty, state estimation, and SLAM",
    mechanisms: ["probability as belief", "sensor noise", "Bayesian filtering", "Kalman filters", "particle filters", "localization", "mapping", "SLAM", "observability", "sensor fusion"],
    friday: { duration: "3 hours", summary: "Reason about what the robot believes, not only what its sensors see.", activities: [
      activity("w5-f1", "Study Cornell state estimation", "Cover Bayesian, Kalman, and particle filtering.", "friday"),
      activity("w5-f2", "Watch Princeton Lectures 10–16", "Follow camera models, optical flow, filtering, localization, mapping, and SLAM.", "friday"),
      activity("w5-f3", "Use Probabilistic Robotics as reference", "Read for gaps rather than cover to cover.", "friday"),
      activity("w5-f4", "Work a noisy-position example", "Do prediction, measurement, and updated estimate in one dimension.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Compare sensors and draw a confident failure.", activities: [
      activity("w5-s1", "Build a sensor-fusion table", "Compare camera, lidar, radar, IMU, encoders, force/torque, and tactile sensing by information, failure, latency, and cost.", "saturday"),
      activity("w5-s2", "Draw a localization failure tree", "Show how a mobile robot can be confidently wrong about its location.", "saturday"),
    ]},
    output: "A sensor-fusion tradeoff table and an uncertainty failure tree.", conversationTest: "What evidence shows that a robot knows where it is, rather than merely recognizing objects?",
    resources: byId(["cornell-schedule", "princeton-intro", "prob-robotics"]),
  },
  {
    id: "week-6", number: 6, title: "Planning, navigation, and task decomposition",
    mechanisms: ["search", "A*", "configuration-space obstacles", "sampling-based planning", "RRT", "trajectory optimization", "collision checking", "behavior trees", "task planning vs. motion planning"],
    friday: { duration: "3 hours", summary: "Separate symbolic task choices from geometric and dynamic feasibility.", activities: [
      activity("w6-f1", "Study Cornell motion planning", "Cover graph and sampling-based methods.", "friday"),
      activity("w6-f2", "Watch Princeton Lectures 2–3", "Build graph-search and RRT intuition.", "friday"),
      activity("w6-f3", "Sample Princeton Lectures 8–9", "See dynamics constraints, differential flatness, trajectory optimization, and time-varying feedback.", "friday"),
      activity("w6-f4", "Skim Planning Algorithms", "Read discrete search and sampling-based planning chapters.", "friday"),
      activity("w6-f5", "Draw configuration space", "Sketch a simple obstacle problem.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Compare A* and RRT, then decompose a household task.", activities: [
      activity("w6-s1", "Interact with A* on a grid", "Compare its behavior with RRT in continuous, high-dimensional space.", "saturday"),
      activity("w6-s2", "Decompose “clear a dinner table”", "Name task planning, motion planning, grasping, control, and recovery.", "saturday"),
    ]},
    output: "One task-to-motion decomposition plus an A* vs. RRT comparison.", conversationTest: "Where does an LLM planner help, and where does it need classical constraints, collision checking, or a controller?",
    resources: byId(["cornell-schedule", "princeton-intro", "planning-algorithms"]),
  },
  {
    id: "week-7", number: 7, title: "ROS 2 and the anatomy of a production robot",
    mechanisms: ["nodes", "topics", "services", "actions", "messages", "transforms (tf2)", "URDF", "launch", "logs", "bags/replay", "real-time vs. non-real-time components"],
    friday: { duration: "3 hours", summary: "Read the nervous system of a robot as data moving across boundaries.", activities: [
      activity("w7-f1", "Complete ROS 2 beginner sequence", "Cover nodes, topics, services, parameters, and actions.", "friday"),
      activity("w7-f2", "Study one URDF", "Identify links, joints, frames, and sensors.", "friday"),
      activity("w7-f3", "Map ROS to the closed loop", "Place concepts on the Week 1 diagram.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Inspect a running graph and identify system boundaries.", activities: [
      activity("w7-s1", "Run turtlesim or browser equivalent", "Inspect topic flow and record/replay if setup permits.", "saturday", true),
      activity("w7-s2", "Read two vault articles", "Read Robots need a nervous system and What Software Engineers Misunderstand About Robotics.", "saturday"),
    ]},
    output: "A system architecture diagram showing data rates, boundaries, and likely failure points.", conversationTest: "Which parts of this system must be deterministic and local, and which can be slower, learned, or cloud-assisted?",
    resources: byId(["ros2", "robots-nervous-system", "software-engineers-robotics"]),
  },
  {
    id: "week-8", number: 8, title: "Perception, grasping, and contact",
    mechanisms: ["image formation", "depth", "detection", "segmentation", "pose estimation", "point clouds", "visual servoing", "grasp pose", "tactile sensing", "contact-rich manipulation"],
    friday: { duration: "3 hours", summary: "Trace pixels to contact and distinguish recognition from actionability.", activities: [
      activity("w8-f1", "Study Berkeley vision Weeks 6–7", "Cover image formation, features, correspondence, and two-view geometry.", "friday"),
      activity("w8-f2", "Separate perception claims", "Distinguish object recognition, 6D pose estimation, and actionable affordances.", "friday"),
      activity("w8-f3", "Trace pick-and-place", "Follow pixels to gripper closure.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Classify failures and compare vision-only with tactile sensing.", activities: [
      activity("w8-s1", "Classify success and failure videos", "Label perception, estimation, planning, grasp selection, force control, or recovery.", "saturday"),
      activity("w8-s2", "Compare sensing approaches", "Compare vision-only and vision-plus-tactile approaches.", "saturday"),
    ]},
    output: "An annotated perception-to-grasp pipeline.", conversationTest: "Why are transparent, deformable, reflective, occluded, and unfamiliar objects still revealing tests?",
    resources: byId(["berkeley-c106"]),
  },
  {
    id: "week-9", number: 9, title: "Robot learning: imitation, reinforcement, and diffusion policies",
    mechanisms: ["demonstrations", "behavior cloning", "covariate shift", "dataset aggregation", "reward design", "offline vs. online RL", "action chunks", "multimodal actions", "diffusion/flow policies"],
    friday: { duration: "3 hours", summary: "Place learning methods alongside scripted and classical control.", activities: [
      activity("w9-f1", "Use ETH Robot Learning as spine", "Cover imitation learning, reinforcement learning, visual control, and manipulation.", "friday"),
      activity("w9-f2", "Watch Princeton Lectures 17–19", "Learn imitation, generative policies, augmentation, and DAgger.", "friday"),
      activity("w9-f3", "Read Diffusion Policy selectively", "Read the abstract, system diagrams, and evaluation sections.", "friday"),
      activity("w9-f4", "Compare four approaches", "Compare hand-coded control, behavior cloning, RL, and a hybrid on one task.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Inspect the shape of a real robot-learning dataset and policy.", activities: [
      activity("w9-s1", "Inspect a LeRobot dataset and policy", "Identify observations, actions, control horizon, training distribution, and evaluation protocol.", "saturday"),
    ]},
    output: "A method-selection matrix: scripted vs. planning/control vs. imitation vs. RL.", conversationTest: "When does more demonstration data fix a robot, and when is the problem actually embodiment, observability, latency, or evaluation?",
    resources: byId(["eth-robot-learning", "princeton-intro", "diffusion-policy", "lerobot"]),
  },
  {
    id: "week-10", number: 10, title: "VLAs, robot foundation models, and the data pyramid",
    mechanisms: ["vision-language-action models", "semantic planning plus fast action models", "cross-embodiment transfer", "tokenized vs. continuous actions", "web/human/synthetic/robot data", "sim-to-real", "fine-tuning"],
    friday: { duration: "3 hours", summary: "Evaluate what “generalist” means across data, embodiment, and time.", activities: [
      activity("w10-f1", "Watch Princeton Lectures 20–23", "Cover VLAs, reinforcement learning, and world models.", "friday"),
      activity("w10-f2", "Read GR00T N1 clipping", "Study the open foundation model framing for generalist humanoids.", "friday"),
      activity("w10-f3", "Compare model families", "Read abstracts, architecture diagrams, data mixture, and limitations for RT-1/RT-2, Open X-Embodiment/RT-X, and one current open VLA in LeRobot.", "friday"),
      activity("w10-f4", "Revisit Interlatent", "Relate the fast/slow architecture and inference-time constraint.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Build an evidence table rather than accepting a generalization headline.", activities: [
      activity("w10-s1", "Read two vault notes", "Read The Data Problem Behind Physical AI Is Changing and Mapping Robot Foundation Models Against Five Bottlenecks.", "saturday"),
      activity("w10-s2", "Build an evidence table", "Capture tasks, embodiments, training data, baseline, success metric, generalization claim, latency, and missing evidence for one model.", "saturday"),
    ]},
    output: "A two-page “how to evaluate an RFM/VLA claim” brief.", conversationTest: "What exactly is generalizing—objects, tasks, environments, embodiments, or merely language instructions?",
    resources: byId(["princeton-intro", "groot", "rt1-rt2", "open-x", "lerobot", "interlatent", "data-problem", "rfm-bottlenecks"]),
  },
  {
    id: "week-11", number: 11, title: "Hardware, safety, reliability, and deployment economics",
    mechanisms: ["actuators", "motors", "gearboxes", "encoders", "torque and payload", "reach", "speed", "battery/runtime", "thermal limits", "calibration", "wear", "safety", "teleoperation", "fleet operations", "uptime"],
    friday: { duration: "3 hours", summary: "Translate component and safety constraints into deployment readiness.", activities: [
      activity("w11-f1", "Learn component tradeoffs", "Compare torque, speed, precision, compliance, efficiency, weight, and cost.", "friday"),
      activity("w11-f2", "Re-read the robotics stack note", "Use an industrialization lens.", "friday"),
      activity("w11-f3", "Learn deployment vocabulary", "Cover functional safety, e-stops, guarding, collaborative operation, and failure recovery; standards are reference material.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Turn capability into a scorecard with economics and intervention visible.", activities: [
      activity("w11-s1", "Read autonomy and software-engineering notes", "Read Robotics Levels of Autonomy and What Software Engineers Misunderstand About Robotics.", "saturday"),
      activity("w11-s2", "Build a deployment model", "Include robot price or lease, integration, utilization, throughput, human supervision ratio, uptime, maintenance, and payback.", "saturday"),
      activity("w11-s3", "Separate success from ROI", "Distinguish technical success rate from useful throughput and customer ROI.", "saturday"),
    ]},
    output: "A deployment scorecard for one robotics company.", conversationTest: "What intervention rate, uptime, throughput, and payback would turn this pilot into a repeatable deployment?",
    resources: byId(["robotics-stack", "robotics-autonomy", "software-engineers-robotics"]),
  },
  {
    id: "week-12", number: 12, title: "Markets, moats, and the capstone conversation brief",
    mechanisms: ["value-chain position", "horizontal foundation models vs. vertical applications", "data flywheels", "deployment learning", "manufacturing scale", "service network", "system integration", "sales cycle", "gross margin", "robots-as-a-service"],
    friday: { duration: "3 hours", summary: "Form a market thesis only after tracing the technical and operational constraints.", activities: [
      activity("w12-f1", "Watch Princeton Lecture 24", "Cover robotics, jobs, ethics, and law.", "friday"),
      activity("w12-f2", "Read three market notes", "Read How to Think About the Robotics Market, Where Does Value Accrue in Robotics, and RoboStrategy Shareholder Letter - No ChatGPT Moment for Robotics.", "friday"),
      activity("w12-f3", "Compare bottleneck theses", "Contrast intelligence, data, hardware supply, and integration/reliability bottlenecks.", "friday"),
      activity("w12-f4", "Name dominant constraints", "State which constraint dominates for industrial arms, warehouse mobile robots, and general-purpose humanoids.", "friday"),
    ]},
    saturday: { duration: "4 hours", summary: "Synthesize one defensible company or robot briefing and test it aloud.", activities: [
      activity("w12-s1", "Prepare a 5–7 minute briefing", "Include job, stack, classical/learned components, data loop, evidence, reliability, economics, competitive position, unknown, and three diligence questions.", "saturday"),
      activity("w12-s2", "Deliver it twice", "Adapt once for a technically curious VC and once for a robotics engineer; remove claims you cannot defend.", "saturday"),
    ]},
    output: "A five-page maximum capstone memo plus a one-page conversation cheat sheet.", conversationTest: "What must become true—technically and economically—for this company to scale by 10×?",
    resources: byId(["princeton-intro", "market-robotics", "value-accrue", "no-chatgpt", "robotics-topic"]),
  },
];

export const curriculumErrors = validateCurriculum(curriculum);
