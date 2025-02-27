use anchor_lang::prelude::*;
use std::mem::size_of;

#[account]
pub struct Controller {
    pub bump: u8,
}

impl Controller {
    pub const CONTROLLER_SPACE: usize = 8 + size_of::<u8>(); // Discriminator
}
