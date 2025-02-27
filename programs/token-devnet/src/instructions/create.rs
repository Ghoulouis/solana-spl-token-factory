use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::{state::Controller, SOLANA_MAX_MINT_DECIMALS};

#[derive(Accounts)]
#[instruction(
    symbol: String,
    decimals: u8,
)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init_if_needed,
        seeds = [b"controller"],
        bump,
        payer = signer,
        space = Controller::CONTROLLER_SPACE,
    )]
    pub controller: Account<'info, Controller>,
    #[account(
        init_if_needed,
        seeds = [symbol.as_bytes()],
        bump,
        mint::authority = controller,
        mint::decimals = decimals,
        payer = signer,
        constraint = decimals <= SOLANA_MAX_MINT_DECIMALS,
        constraint = symbol.len() <= 32
    )]
    pub token: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub(crate) fn handler(ctx: Context<CreateToken>, symbol: String, decimals: u8) -> Result<()> {
    let controller = &mut ctx.accounts.controller;
    controller.bump = ctx.bumps.controller;
    msg!("Token {} created with {} decimals", symbol, decimals);

    Ok(())
}
