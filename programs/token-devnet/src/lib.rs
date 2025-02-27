use anchor_lang::prelude::*;

use crate::instructions::*;
use crate::state::*;

pub mod constants;
pub mod instructions;
pub mod state;

declare_id!("6Y32aZTKjC7GdDkdpyCwPdMP5vPdnuD2siSAKbh16Vwp");
const SOLANA_MAX_MINT_DECIMALS: u8 = 9;

#[program]
pub mod token_devnet {
    use super::*;

    // pub fn init(ctx: Context<Init>) -> Result<()> {
    //     instructions::init::handler()
    // }

    pub fn create(ctx: Context<CreateToken>, symbol: String, decimals: u8) -> Result<()> {
        instructions::create::handler(ctx, symbol, decimals)
    }

    pub fn mint(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        instructions::mint::handler(ctx, amount)
    }
}
