# Engineering Leadership: Technical Debt Management and Code Review Culture

## Strategic Technical Debt Management
- **Intentional vs Accidental Debt**:
  - Intentional / Prudent Debt: Consciously cutting corners or taking architectural shortcuts to meet critical market deadlines with an agreed repayment schedule.
  - Inadvertent / Reckless Debt: Low engineering hygiene, lack of test automation, and architectural drift resulting from poor practices.
- **Quantifying & Repaying Debt**:
  - Allocating dedicated capacity (e.g. 15-20% of sprint velocity or dedicated stabilization sprints).
  - Tracking debt impact on business metrics: cycle time, deployment frequency, mean time to recovery (MTTR), and customer defect escape rate.
  - Implementing Architectural Decision Records (ADRs) to document why decisions were made and when they should be revisited.

## High-Performing Code Review Culture
- **Review Goals**: Knowledge sharing, maintainability, correctness, and architectural consistency—not gatekeeping or subjective nitpicking.
- **Automation First**: Linters, formatters, and static security analyzers run in CI so humans focus on architectural logic, failure modes, and edge cases.
- **Constructive Communication**: Prefixing comments with intent (e.g. `[Blocking]`, `[Suggestion]`, `[Question]`), praising clean solutions, and resolving disputes synchronously when thread depth exceeds 3 comments.
