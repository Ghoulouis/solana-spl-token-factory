import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"; // Import đầy đủ anchor
import { Program } from "@coral-xyz/anchor";
import { TokenDevnet } from "../target/types/token_devnet";

const CONTROLLER_SEED = "controller";

async function main() {
    // Thiết lập provider và program
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.TokenDevnet as Program<TokenDevnet>;

    const wallet = anchor.Wallet.local();

    console.log(" xx", wallet.publicKey.toBase58());
    // // Tạo USDC token
    const usdcPda = PublicKey.findProgramAddressSync([Buffer.from("USDC")], program.programId)[0];
    const symbol = "USDC";
    const decimals = 6;
    console.log("Creating USDC token");

    const controllerPda = PublicKey.findProgramAddressSync([Buffer.from(CONTROLLER_SEED)], program.programId)[0];
    const tokenPda = PublicKey.findProgramAddressSync([Buffer.from(symbol)], program.programId)[0];
    console.log("token Pda = ", tokenPda.toBase58());
    // Gọi hàm create và lấy transaction hash
    const txHash = await program.methods
        .create(symbol, decimals)
        .accountsPartial({
            signer: wallet.publicKey,
            controller: controllerPda,
            token: tokenPda,
        })
        .signers([wallet.payer])
        .rpc();

    console.log("Transaction hash:", txHash);

    console.log(`View transaction on Solana Explorer: https://solscan.io/tx/${txHash}?cluster=devnet`);
}

main().catch((err) => {
    console.error("Error:", err);
});
