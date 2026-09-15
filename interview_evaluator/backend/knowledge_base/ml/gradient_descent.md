# Optimization Algorithms: Gradient Descent Variants, Momentum, and Learning Rates

## 1. Fundamentals of Gradient Descent
Gradient descent is an iterative first-order optimization algorithm used to minimize an objective loss function $J(\theta)$ parameterized by model parameters $\theta \in \mathbb{R}^d$. The parameter update rule is:
$$\theta_{t+1} = \theta_t - \eta \nabla_\theta J(\theta_t)$$
where $\eta > 0$ is the learning rate (step size), and $\nabla_\theta J(\theta_t)$ represents the gradient vector of partial derivatives pointing in the direction of steepest ascent.

## 2. Variants of Gradient Descent
1. **Batch Gradient Descent (BGD)**:
   - Computes gradients across the entire training dataset of $N$ samples in each iteration.
   - **Pros**: Guaranteed deterministic convergence to the global minimum for convex error surfaces, or a local minimum for non-convex surfaces.
   - **Cons**: Extremely slow and memory-prohibitive for large datasets; cannot perform online updates with streaming data.

2. **Stochastic Gradient Descent (SGD)**:
   - Evaluates the gradient on a single randomly selected sample $(x_i, y_i)$ per step.
   - **Pros**: Very fast updates and minimal memory footprint. The noisy gradient trajectory helps jump out of shallow local minima or saddle points.
   - **Cons**: Severe oscillations and high variance around the minimum; requires careful learning rate decay schedules to settle into a good optimum.

3. **Mini-Batch Gradient Descent**:
   - Compromise computing gradients over mini-batches of size $B$ (typically 32, 64, 128, or 256).
   - Leverages vectorization and parallel hardware acceleration (GPUs/TPUs) while moderating variance. Standard in modern deep learning.

## 3. Adaptive Optimizers and Challenges
- **Momentum**: Accelerates SGD in relevant directions and dampens oscillations by accumulating a velocity vector of past gradients:
  $$v_t = \gamma v_{t-1} + \eta \nabla_\theta J(\theta_t), \quad \theta_{t+1} = \theta_t - v_t$$
- **Adam (Adaptive Moment Estimation)**:
  Maintains exponentially decaying averages of past gradients (first moment, mean $m_t$) and past squared gradients (second uncentered moment, variance $v_t$), providing individual adaptive learning rates for each parameter.
- **Vanishing and Exploding Gradients**:
  In deep architectures, backpropagated gradients can shrink exponentially toward zero (vanishing) or expand exponentially (exploding), mitigated via Batch Normalization, residual connections, gradient clipping, and modern activation functions (ReLU/GELU).
