use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, TransferChecked};

use crate::error::MockDefiError;
use crate::state::PoolState;

#[event]
pub struct SwapEvent {
    pub user: Pubkey,
    pub direction: u8,
    pub amount_in: u64,
    pub amount_out: u64,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool_state", pool_state.mint_a.as_ref(), pool_state.mint_b.as_ref()],
        bump = pool_state.bump
    )]
    pub pool_state: Account<'info, PoolState>,

    /// CHECK: PDA authority for vaults.
    #[account(
        seeds = [b"pool_authority", pool_state.key().as_ref()],
        bump = pool_state.authority_bump
    )]
    pub pool_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub user_source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_destination: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_destination: Account<'info, TokenAccount>,
    pub source_mint: Account<'info, Mint>,
    pub destination_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

pub fn swap_handler(ctx: Context<Swap>, amount_in: u64, direction: u8) -> Result<()> {
    require!(amount_in > 0, MockDefiError::InvalidAmount);
    require!(ctx.accounts.vault_destination.amount >= amount_in, MockDefiError::InsufficientLiquidity);

    let transfer_in_accounts = TransferChecked {
        from: ctx.accounts.user_source.to_account_info(),
        to: ctx.accounts.vault_source.to_account_info(),
        mint: ctx.accounts.source_mint.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let transfer_in_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_in_accounts);
    token::transfer_checked(transfer_in_ctx, amount_in, ctx.accounts.source_mint.decimals)?;

    let pool_key = ctx.accounts.pool_state.key();
    let authority_seeds: &[&[u8]] = &[
        b"pool_authority",
        pool_key.as_ref(),
        &[ctx.accounts.pool_state.authority_bump],
    ];

    let transfer_out_accounts = TransferChecked {
        from: ctx.accounts.vault_destination.to_account_info(),
        to: ctx.accounts.user_destination.to_account_info(),
        mint: ctx.accounts.destination_mint.to_account_info(),
        authority: ctx.accounts.pool_authority.to_account_info(),
    };
    let transfer_out_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_out_accounts,
        &[authority_seeds],
    );
    token::transfer_checked(
        transfer_out_ctx,
        amount_in,
        ctx.accounts.destination_mint.decimals,
    )?;

    emit!(SwapEvent {
        user: ctx.accounts.user.key(),
        direction,
        amount_in,
        amount_out: amount_in,
    });

    Ok(())
}
