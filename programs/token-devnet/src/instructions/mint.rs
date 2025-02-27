use anchor_lang::prelude::*;
use anchor_spl::{associated_token::*, token::{self, Mint, MintTo, Token, TokenAccount}};

use crate::{state::{controller, Controller}, SOLANA_MAX_MINT_DECIMALS};

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"controller"],
        bump, 
    )]
    pub controller: Account<'info, Controller>,
    #[account(mut)] 
    pub token: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::authority = signer,
        associated_token::mint = token,
    )]
    pub signer_ata: Account<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub(crate) fn handler(ctx: Context<MintToken>, amount: u64) -> Result<()> {
    let controller = &mut ctx.accounts.controller;

    let controller_pda_signer: &[&[&[u8]]] = &[&[b"controller", &[controller.bump]]];
                                      
    let cpi_accounts = MintTo {
        mint: ctx.accounts.token.to_account_info(),
        to: ctx.accounts.signer_ata.to_account_info(), 
        authority: ctx.accounts.controller.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        controller_pda_signer,
    );

    // Gọi CPI để mint token
    token::mint_to(cpi_ctx, amount)?;

    msg!("Minted {} tokens to {}", amount, ctx.accounts.signer.key());
    Ok(())
}
