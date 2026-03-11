"""
Semi-Synthetic Outcome Generator
Creates a realistic outcome with strong treatment signal for optimization.
"""

import numpy as np
import pandas as pd


def add_semi_synthetic_outcome(df, seed=42):
    """
    Construct a semi-synthetic binary outcome 'outcome_synth' on top of IHDS covariates.
    This injects a strong, heterogeneous treatment effect so the optimizer has signal.

    Key insights:
    - Base risk depends on income, health_index, education_index, urban, poor
    - Cash_transfer and NREGA have positive effects, larger for poor, low-income, low-health households
    - Add noise, then threshold to 0/1
    """
    rng = np.random.default_rng(seed)
    df = df.copy()

    # Extract covariates
    income = df['income'].values
    health = df['health_index'].values
    educ = df['education_index'].values
    urban = df['urban'].values
    poor = df['poor'].values if 'poor' in df.columns else np.zeros(len(df))

    # Normalize income
    income_log = np.log1p(income)
    income_std = (income_log - income_log.mean()) / (income_log.std() + 1e-6)

    # Base logit: better income/health/education → higher outcome prob; being poor hurts
    base_logit = (
        0.5 * income_std
        + 0.8 * health
        + 0.6 * educ
        + 0.2 * urban
        - 0.3 * poor
    )

    # Extract treatments
    cash = df['cash_transfer'].values
    nrega = df['nrega_program'].values
    nrega_amt = df['nrega_amount'].values if 'nrega_amount' in df.columns else np.zeros(len(df))

    # Heterogeneous treatment effects
    # Cash transfer: more effective for poor, low-income, low-health households
    cash_effect = 0.00015 * cash * (1 + poor) * (1.5 - health)

    # NREGA: more effective for rural poor (urban=0), low-income households
    nrega_effect = 0.4 * nrega * (1 + poor) * (1 - urban) * (1.5 - health)

    # Interaction effect if both treatments present
    interaction_effect = 0.1 * (cash > 500) * nrega * (1 + poor)

    # Total treatment effect
    te_logit = cash_effect + nrega_effect + interaction_effect

    # Add noise and convert to probability
    noise = rng.normal(0, 0.5, size=len(df))
    logit = base_logit + te_logit + noise

    # Logistic transformation
    prob = 1.0 / (1.0 + np.exp(-logit))

    # Sample binary outcome from Bernoulli distribution
    outcome_synth = rng.binomial(1, prob, size=len(df))

    df['outcome_synth'] = outcome_synth
    df['outcome_synth_prob'] = prob

    return df
