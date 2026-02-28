use anchor_lang::prelude::*;

#[account]
pub struct PoolState {
    pub admin: Pubkey,
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub bump: u8,
    pub authority_bump: u8,
}

impl PoolState {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 1 + 1;
}
