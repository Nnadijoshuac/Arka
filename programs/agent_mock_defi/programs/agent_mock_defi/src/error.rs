use anchor_lang::prelude::*;

#[error_code]
pub enum MockDefiError {
    #[msg("Insufficient vault liquidity")]
    InsufficientLiquidity,
    #[msg("Invalid amount")]
    InvalidAmount,
}
