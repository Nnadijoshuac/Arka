use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::PoolState;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        space = PoolState::LEN,
        seeds = [b"pool_state", mint_a.key().as_ref(), mint_b.key().as_ref()],
        bump
    )]
    pub pool_state: Account<'info, PoolState>,

    /// CHECK: PDA authority used for vault signing only.
    #[account(
        seeds = [b"pool_authority", pool_state.key().as_ref()],
        bump
    )]
    pub pool_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = admin,
        associated_token::mint = mint_a,
        associated_token::authority = pool_authority
    )]
    pub vault_a: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = admin,
        associated_token::mint = mint_b,
        associated_token::authority = pool_authority
    )]
    pub vault_b: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializePool>) -> Result<()> {
    let pool = &mut ctx.accounts.pool_state;
    pool.admin = ctx.accounts.admin.key();
    pool.mint_a = ctx.accounts.mint_a.key();
    pool.mint_b = ctx.accounts.mint_b.key();
    pool.bump = ctx.bumps.pool_state;
    pool.authority_bump = ctx.bumps.pool_authority;
    Ok(())
}
