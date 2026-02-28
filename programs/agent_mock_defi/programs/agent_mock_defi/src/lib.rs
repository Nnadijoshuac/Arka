use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("AgntWal1et111111111111111111111111111111111");

#[program]
pub mod agent_mock_defi {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        instructions::initialize_pool::handler(ctx)
    }

    pub fn swap_a_for_b(ctx: Context<Swap>, amount_in: u64) -> Result<()> {
        instructions::swap::swap_handler(ctx, amount_in, 1)
    }

    pub fn swap_b_for_a(ctx: Context<Swap>, amount_in: u64) -> Result<()> {
        instructions::swap::swap_handler(ctx, amount_in, 2)
    }
}
